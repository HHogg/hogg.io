use std::collections::{BTreeMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{bail, Context, Result};
use hogg_tiling_generator::build::Plane;
use hogg_tiling_generator::notation::Notation;
use serde::{Deserialize, Serialize};

const REPETITIONS: u8 = 3;

#[derive(Debug)]
struct Args {
  json: PathBuf,
  csv: PathBuf,
}

impl Args {
  fn parse() -> Result<Self> {
    let mut args = std::env::args().skip(1);
    let mut json = PathBuf::from("./results/output.json");
    let mut csv = PathBuf::from("./results/output.csv");

    while let Some(argument) = args.next() {
      match argument.as_str() {
        "--json" => json = args.next().context("--json requires a path")?.into(),
        "--csv" => csv = args.next().context("--csv requires a path")?.into(),
        _ => bail!("unknown argument: {argument}"),
      }
    }

    Ok(Self { json, csv })
  }
}

#[derive(Debug, Deserialize, Serialize)]
struct OutputTiling {
  notation: String,
  hash: String,
  has_0: bool,
  has_3: bool,
  has_4: bool,
  has_6: bool,
  has_8: bool,
  has_12: bool,
  path_index: i32,
  transform_index: i32,
  timestamp: String,
}

fn main() -> Result<()> {
  let args = Args::parse()?;
  let json =
    fs::read_to_string(&args.json).with_context(|| format!("reading {}", args.json.display()))?;
  let mut tilings: Vec<OutputTiling> =
    serde_json::from_str(&json).with_context(|| format!("parsing {}", args.json.display()))?;
  let mut hashes = BTreeMap::<String, String>::new();

  for (index, tiling) in tilings.iter_mut().enumerate() {
    let hash = hash_notation(&tiling.notation)
      .with_context(|| format!("hashing result {} ({})", index + 1, tiling.notation))?;

    if let Some(existing) = hashes.insert(hash.clone(), tiling.notation.clone()) {
      bail!(
        "conflicting canonical hash {hash}: {existing} and {}",
        tiling.notation
      );
    }

    tiling.hash = hash;
  }

  write_json(&args.json, &tilings)?;
  write_csv(&args.csv, &tilings)?;

  println!("Backfilled {} unique tiling hashes", tilings.len());
  Ok(())
}

fn hash_notation(notation: &str) -> Result<String> {
  let notation = Notation::default()
    .from_string(notation, false, false)
    .with_context(|| format!("parsing notation {notation}"))?;
  let mut plane = Plane::default()
    .with_repetitions(REPETITIONS)
    .from_notation(&notation)
    .with_context(|| format!("building notation {notation}"))?;

  plane
    .create_hash()
    .with_context(|| format!("creating hash for {notation}"))?;

  let hash = plane
    .hash
    .as_ref()
    .context("Plane::create_hash did not populate Plane::hash")?
    .to_string();

  validate_hash(&hash)?;
  Ok(hash)
}

fn validate_hash(hash: &str) -> Result<()> {
  let Some(digest) = hash.strip_prefix("th1:") else {
    bail!("hash does not use the th1 format: {hash}");
  };

  if digest.len() != 64
    || !digest
      .bytes()
      .all(|byte| matches!(byte, b'0'..=b'9' | b'a'..=b'f'))
  {
    bail!("hash has an invalid SHA-256 digest: {hash}");
  }

  Ok(())
}

fn write_json(path: &Path, tilings: &[OutputTiling]) -> Result<()> {
  let rows = tilings
    .iter()
    .map(serde_json::to_string)
    .collect::<Result<Vec<_>, _>>()?;
  let output = format!("[\n  {}\n]\n", rows.join(",\n  "));

  fs::write(path, output).with_context(|| format!("writing {}", path.display()))
}

fn write_csv(path: &Path, tilings: &[OutputTiling]) -> Result<()> {
  let mut output = String::from("notation,hash\n");
  let mut notations = HashSet::new();

  for tiling in tilings {
    if !notations.insert(&tiling.notation) {
      bail!("duplicate notation in output: {}", tiling.notation);
    }

    output.push_str(&tiling.notation);
    output.push(',');
    output.push_str(&tiling.hash);
    output.push('\n');
  }

  fs::write(path, output).with_context(|| format!("writing {}", path.display()))
}
