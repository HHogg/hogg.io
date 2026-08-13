#[path = "./isometry_tests.rs"]
#[cfg(test)]
mod tests;

use std::collections::{BTreeMap, VecDeque};

use hogg_geometry::{Affine2, Vector2};

use super::error::{Error, Result};

const MATRIX_SCALE: f64 = 100_000_000.0;
const EPSILON: f64 = 0.000_001;
const MAX_POINT_GROUP_SIZE: usize = 128;
const MAX_RATIONAL_DENOMINATOR: i128 = 512;

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
struct LinearKey([i64; 4]);

fn vector_approx_eq(first: Vector2, second: Vector2) -> bool {
  (first.x - second.x).abs() <= EPSILON && (first.y - second.y).abs() <= EPSILON
}

fn linear_key(transform: &Affine2) -> LinearKey {
  LinearKey(
    transform
      .linear()
      .map(|value| (value * MATRIX_SCALE).round() as i64),
  )
}

fn is_identity(transform: &Affine2) -> bool {
  linear_key(transform) == linear_key(&Affine2::identity())
}

fn transform_approx_eq(first: &Affine2, second: &Affine2) -> bool {
  let first_translation = first.translation();
  let second_translation = second.translation();

  linear_key(first) == linear_key(second) && vector_approx_eq(first_translation, second_translation)
}

#[derive(Clone, Copy, Debug)]
pub(super) struct Lattice {
  first: Vector2,
  second: Vector2,
}

impl Lattice {
  fn new(first: Vector2, second: Vector2) -> Result<Self> {
    let lattice = Self { first, second };

    if lattice.area() <= EPSILON {
      return Err(Error::new("the symmetry translations do not span a plane"));
    }

    Ok(lattice)
  }

  fn from_translations(translations: &[Vector2]) -> Result<Self> {
    let translations = translations
      .iter()
      .copied()
      .filter(|translation| translation.length() > EPSILON)
      .collect::<Vec<_>>();

    let (first, second) = translations
      .iter()
      .enumerate()
      .find_map(|(first_index, first)| {
        translations
          .iter()
          .skip(first_index + 1)
          .find(|second| first.cross(**second).abs() > EPSILON * first.length() * second.length())
          .map(|second| (*first, *second))
      })
      .ok_or_else(|| Error::new("the symmetry group has no rank-two translation lattice"))?;

    let determinant = first.cross(second);
    let coefficients = translations
      .iter()
      .map(|translation| {
        Vector2::new(
          translation.cross(second) / determinant,
          first.cross(*translation) / determinant,
        )
      })
      .collect::<Vec<_>>();

    let lattice = Self::from_coefficients(first, second, &coefficients)?;
    lattice.verify_contains(&translations)?;
    Ok(lattice)
  }

  pub(super) fn coordinates(&self, vector: Vector2) -> Vector2 {
    let determinant = self.first.cross(self.second);

    Vector2::new(
      vector.cross(self.second) / determinant,
      self.first.cross(vector) / determinant,
    )
  }

  pub(super) fn refine_coordinates(&self, translations: &[Vector2]) -> Result<Self> {
    let mut coefficients = vec![Vector2::new(1.0, 0.0), Vector2::new(0.0, 1.0)];
    coefficients.extend_from_slice(translations);

    let lattice = Self::from_coefficients(self.first, self.second, &coefficients)?;
    let world_translations = coefficients
      .iter()
      .map(|coefficient| self.first * coefficient.x + self.second * coefficient.y)
      .collect::<Vec<_>>();

    lattice.verify_contains(&world_translations)?;
    Ok(lattice)
  }

  pub(super) fn area(&self) -> f64 {
    self.first.cross(self.second).abs()
  }

  fn from_coefficients(first: Vector2, second: Vector2, coefficients: &[Vector2]) -> Result<Self> {
    let rational = coefficients
      .iter()
      .map(|coefficient| {
        Ok((
          Rational::approximate(coefficient.x)?,
          Rational::approximate(coefficient.y)?,
        ))
      })
      .collect::<Result<Vec<_>>>()?;

    let denominator = rational.iter().try_fold(1_i128, |denominator, (x, y)| {
      checked_lcm(checked_lcm(denominator, x.denominator)?, y.denominator)
    })?;

    let integer_vectors = rational
      .iter()
      .map(|(x, y)| {
        Ok((
          x.numerator
            .checked_mul(denominator / x.denominator)
            .ok_or_else(|| Error::new("integer lattice coordinate overflow"))?,
          y.numerator
            .checked_mul(denominator / y.denominator)
            .ok_or_else(|| Error::new("integer lattice coordinate overflow"))?,
        ))
      })
      .collect::<Result<Vec<_>>>()?;

    let (basis_first, basis_second) = integer_lattice_basis(&integer_vectors)?;
    let denominator = denominator as f64;

    Self::new(
      first * (basis_first.0 as f64 / denominator) + second * (basis_first.1 as f64 / denominator),
      first * (basis_second.0 as f64 / denominator)
        + second * (basis_second.1 as f64 / denominator),
    )
  }

  fn verify_contains(&self, translations: &[Vector2]) -> Result<()> {
    for translation in translations {
      let coordinate = self.coordinates(*translation);

      if (coordinate.x - coordinate.x.round()).abs() > EPSILON
        || (coordinate.y - coordinate.y.round()).abs() > EPSILON
      {
        return Err(Error::new(
          "translation lattice rationalization failed verification",
        ));
      }
    }

    Ok(())
  }
}

pub(super) struct Periodicity {
  pub(super) representatives: Vec<Affine2>,
  pub(super) lattice: Lattice,
}

pub(super) fn derive_periodicity(source: &[Affine2]) -> Result<Periodicity> {
  if source.is_empty() {
    return Err(Error::new("no periodic symmetry generators were recorded"));
  }

  let mut generators = Vec::new();

  for generator in source {
    let inverse = generator
      .inverse()
      .ok_or_else(|| Error::new("a recorded symmetry transform is not invertible"))?;

    for candidate in [*generator, inverse] {
      if !generators
        .iter()
        .any(|existing: &Affine2| transform_approx_eq(existing, &candidate))
      {
        generators.push(candidate);
      }
    }
  }

  let identity = Affine2::identity();
  let mut representatives = vec![identity];
  let mut indexes = BTreeMap::from([(linear_key(&identity), 0_usize)]);
  let mut queue = VecDeque::from([0_usize]);

  while let Some(index) = queue.pop_front() {
    let representative = representatives[index];

    for generator in &generators {
      let candidate = generator.compose(&representative);
      let key = linear_key(&candidate);

      if indexes.contains_key(&key) {
        continue;
      }

      if representatives.len() >= MAX_POINT_GROUP_SIZE {
        return Err(Error::new(
          "the symmetry generators do not have a finite crystallographic point group",
        ));
      }

      let next_index = representatives.len();
      representatives.push(candidate);
      indexes.insert(key, next_index);
      queue.push_back(next_index);
    }
  }

  let mut translations = Vec::new();

  for representative in &representatives {
    for generator in &generators {
      let candidate = generator.compose(representative);
      let target_index = indexes
        .get(&linear_key(&candidate))
        .ok_or_else(|| Error::new("point-group enumeration produced an unknown linear part"))?;
      let kernel = representatives[*target_index]
        .inverse()
        .ok_or_else(|| Error::new("a point-group representative is not invertible"))?
        .compose(&candidate);

      if !is_identity(&kernel) {
        return Err(Error::new(
          "a Schreier generator did not reduce to a translation",
        ));
      }

      let translation = kernel.translation();

      if translation.length() > EPSILON
        && !translations
          .iter()
          .any(|existing| vector_approx_eq(*existing, translation))
      {
        translations.push(translation);
      }
    }
  }

  Ok(Periodicity {
    representatives,
    lattice: Lattice::from_translations(&translations)?,
  })
}

#[derive(Clone, Copy)]
struct Rational {
  numerator: i128,
  denominator: i128,
}

impl Rational {
  fn approximate(value: f64) -> Result<Self> {
    if !value.is_finite() {
      return Err(Error::new("non-finite lattice coordinate"));
    }

    let tolerance = EPSILON * value.abs().max(1.0);

    for denominator in 1..=MAX_RATIONAL_DENOMINATOR {
      let numerator = (value * denominator as f64).round() as i128;

      if (value - numerator as f64 / denominator as f64).abs() <= tolerance {
        let divisor = gcd(numerator.abs(), denominator);

        return Ok(Self {
          numerator: numerator / divisor,
          denominator: denominator / divisor,
        });
      }
    }

    Err(Error::new(format!(
      "could not prove rational lattice coordinate {value}",
    )))
  }
}

fn integer_lattice_basis(vectors: &[(i128, i128)]) -> Result<((i128, i128), (i128, i128))> {
  let mut determinant_gcd = 0_i128;

  for (index, first) in vectors.iter().enumerate() {
    for second in vectors.iter().skip(index + 1) {
      let determinant = first
        .0
        .checked_mul(second.1)
        .and_then(|left| {
          first
            .1
            .checked_mul(second.0)
            .and_then(|right| left.checked_sub(right))
        })
        .and_then(i128::checked_abs)
        .ok_or_else(|| Error::new("integer lattice determinant overflow"))?;
      determinant_gcd = gcd(determinant_gcd, determinant);
    }
  }

  if determinant_gcd == 0 {
    return Err(Error::new(
      "integer translation generators have rank less than two",
    ));
  }

  let mut y_gcd = 0_i128;
  let mut x_for_y_gcd = 0_i128;

  for (x, y) in vectors {
    if *y == 0 {
      continue;
    }

    let (next_gcd, previous_coefficient, next_coefficient) =
      extended_gcd_nonnegative(y_gcd, y.abs());
    let next_coefficient = if *y < 0 {
      -next_coefficient
    } else {
      next_coefficient
    };

    x_for_y_gcd = previous_coefficient
      .checked_mul(x_for_y_gcd)
      .and_then(|left| {
        next_coefficient
          .checked_mul(*x)
          .and_then(|right| left.checked_add(right))
      })
      .ok_or_else(|| Error::new("integer lattice reduction overflow"))?;
    y_gcd = next_gcd;
  }

  if y_gcd == 0 || determinant_gcd % y_gcd != 0 {
    return Err(Error::new(
      "could not reduce the integer translation lattice",
    ));
  }

  let x_step = determinant_gcd / y_gcd;
  let x_offset = x_for_y_gcd.rem_euclid(x_step);
  let basis = ((x_step, 0), (x_offset, y_gcd));

  for (x, y) in vectors {
    if y % y_gcd != 0 {
      return Err(Error::new(
        "integer lattice basis does not contain a generator",
      ));
    }

    let second_coefficient = y / y_gcd;

    let remainder = x_offset
      .checked_mul(second_coefficient)
      .and_then(|offset| x.checked_sub(offset))
      .ok_or_else(|| Error::new("integer lattice containment overflow"))?;

    if remainder % x_step != 0 {
      return Err(Error::new(
        "integer lattice basis does not contain a generator",
      ));
    }
  }

  Ok(basis)
}

fn gcd(mut first: i128, mut second: i128) -> i128 {
  first = first.abs();
  second = second.abs();

  while second != 0 {
    let remainder = first % second;
    first = second;
    second = remainder;
  }

  first
}

fn checked_lcm(first: i128, second: i128) -> Result<i128> {
  first
    .checked_div(gcd(first, second))
    .and_then(|value| value.checked_mul(second))
    .ok_or_else(|| Error::new("rational lattice denominator overflow"))
}

fn extended_gcd_nonnegative(first: i128, second: i128) -> (i128, i128, i128) {
  if second == 0 {
    return (first, 1, 0);
  }

  let (gcd, x, y) = extended_gcd_nonnegative(second, first % second);
  (gcd, y, x - (first / second) * y)
}
