# Canonical Tiling Hash Implementation Plan

## Status

The canonical hash implementation and checked-in catalogue backfill are complete. The replacement retains shared `hogg_geometry::Affine2` symmetry generators privately on `Plane`, derives a proven translation lattice, builds and validates a finite chamber quotient, reduces enlarged translation cells, and emits a versioned SHA-256 hash. All 23 hash-scoped tests and all 72 generator tests pass through the package's normal Cargo test target. The 257 checked-in catalogue rows have been explicitly rebuilt as unique `th1` hashes. Live datastore migration and a later searcher run remain deliberately deferred.

## Goal

Replace the internals of the existing `Hash` type with a canonical identity for connected, periodic, edge-to-edge tilings of regular polygons.

Keep the existing API and wire shape. Do not introduce a parallel `CanonicalLabel` type or a second public creation path.

## API contract

The entry point remains:

```rust
impl Hash {
  pub fn build(plane: &Plane) -> Self;
}
```

The surrounding behavior remains in place:

- `Plane::create_hash()` calls `Hash::build(&self)` and stores the result in `Plane::hash`;
- the existing `Hashing` feature toggle may continue to decide whether the normal build path calls `Plane::create_hash()`;
- `build::Result` continues to contain `Hash`;
- `Display` produces the externally visible string;
- the manual `Serialize` implementation continues to serialize that string;
- the searcher, datastore, WASM types, and UI keep consuming the same string field.

All new data structures and algorithms belong privately inside `generator/src/hash/`. The existing point-sequence preparation and delegation remain in `Plane::create_hash()`; new algorithm-specific work belongs behind `Hash::build`.

The unchanged `Hash::build` return type cannot directly return a construction error. `Hash` therefore holds a private success/error state and exposes a `pub(crate)` check that lets `Plane::create_hash()` convert failure into its existing `Result` before storing the hash. Unsupported or incomplete inputs do not silently receive an empty or approximate identity.

`Display` returns a `th1:<sha256>` value for a successfully built hash and remains empty for `Hash::default()` or a failed internal state. `Plane::create_hash()` never stores a failed state.

## Equivalence contract

Two hashes are equal when their planes represent the same periodic combinatorial tiling after ignoring:

- notation, seed, and placement order;
- transform origin and generator choice;
- translation and rotation;
- global reflection;
- uniform scale;
- primitive versus enlarged fundamental regions.

Polygon side counts and the complete vertex-edge-face incidence structure are significant.

Only periodic tilings are supported. If a finite periodic quotient cannot be proved complete, hash construction must fail rather than use a fixed repetition count or sampled neighbourhood.

## Target pipeline

```text
Hash::build(&Plane)
  -> retained affine symmetry generators
  -> proven rank-two translation lattice
  -> complete finite periodic chamber quotient
  -> maximal translation quotient
  -> canonical versioned bytes
  -> digest and Display string
```

Coordinates may help discover incidence and periodic correspondences, but no floating-point coordinates, insertion-order IDs, or hash-map iteration order may enter the canonical bytes.

## Intended module layout

```text
workspaces/geometry/src/
  affine.rs
  affine_tests.rs
  vector.rs
  vector_tests.rs

workspaces/tilings/src-rust/generator/src/hash/
  mod.rs
  hash_tests.rs
  error.rs
  isometry.rs
  quotient.rs
  canonical.rs
```

Start with fewer files if that keeps the implementation clearer. `mod.rs` remains the owner of the existing `Hash` API.

Tests follow the existing package convention: place each `*_tests.rs` beside the source file it covers and include it from that source file with an explicit `#[path = "./name_tests.rs"]` and `#[cfg(test)]`. Do not create a separate `generator/tests/` hierarchy for this work.

## Phase 0: Remove the unfinished implementation

Status: Complete (2026-07-09).

- remove the iterative local vertex, edge, and face hash modules;
- retain the existing `Hash::build(&Plane) -> Hash` signature;
- retain `Default`, `Clone`, `Debug`, `Display`, and string serialization;
- make `Hash::build` return the empty stub;
- make `Display` return an empty string.

No compatibility tests for the removed algorithm are required.

## Phase 1: Add colocated Rust hash behavior cases

Status: Complete (2026-07-10).

The nine direct cases are in [`generator/src/hash/hash_tests.rs`](../../workspaces/tilings/src-rust/generator/src/hash/hash_tests.rs) and are included from `hash/mod.rs` using the package's normal colocated-test pattern.

Put the direct hash cases in `generator/src/hash/hash_tests.rs`, next to `mod.rs`, following the pattern used by `plane.rs`/`plane_tests.rs`, `path.rs`/`path_tests.rs`, and the rest of the package:

```rust
#[path = "./hash_tests.rs"]
#[cfg(test)]
mod tests;
```

Do not add an external fixture format, schema loader, witness graph, supporting test framework, or separate integration-test directory.

The test helper should:

1. build a notation at a requested repetition count;
2. call `Plane::create_hash()`;
3. return the displayed hash string.

Add direct equality tests for:

- translated and rotated square constructions;
- alternate square, triangular, and hexagonal generators;
- different seeds and placement patches;
- the reflected snub-square pair;
- primitive and enlarged square fundamental regions;
- repetition-count independence.

Add direct inequality tests for the following pairs.

These two triangle/hexagon tilings share the same local vertex, edge, and face vocabularies but have different bulk face ratios:

```text
3-3,3-6-6,6/m90/r(h2)
3-3,3-3-3-6/m90/r(h1)
```

These two notations must also produce different hashes:

```text
6-3-3,3-3/r60/r(h13)
6-3-3-3-3/m30/m(v3)
```

Keep unusual equivalence reasoning as short comments beside the relevant cases. Tests should compare hashes, not restate or preserve behavior from the removed implementation. Do not add tests for whether ordinary builds invoke hashing.

The shared helper builds every notation, calls `Plane::create_hash()`, and rejects empty strings before comparing values, so equality cases cannot pass vacuously. The cases are enabled now that the implementation has replaced the stub.

## Phase 2: Establish the periodic data available to `Hash::build`

Status: Implemented and verified by the hash-scoped Cargo tests (2026-08-13).

`Plane` now retains the shared `hogg_geometry::Affine2` reflections and rotations actually resolved while the notation is applied. Each transform is constructed once, used to transform the plane's tiles, and retained for the later explicit hash call. Repetitions are deduplicated. `Hash::build` composes those same transforms to enumerate the finite point group and uses the shared `hogg_geometry::Vector2` with Schreier generators to derive and verify a rank-two translation lattice. The hash no longer maintains duplicate vector, matrix, or affine-isometry implementations.

The descriptor is construction metadata only. It is not serialized and does not enter canonical bytes; equivalent generator choices are normalized by the quotient construction.

Exit criteria:

- periodic generators or a translation lattice are available to `Hash::build`;
- closure can be proved independently of render repetition count;
- incomplete or ambiguous periodic data produces a typed failure.

## Phase 3: Extract a complete incidence map

Status: Implemented and verified by the hash-scoped Cargo tests (2026-08-13).

Apply point-group representatives to the placement faces and reduce their vertices modulo the proven lattice. Convert that complete finite face set into integer combinatorial data:

- stable internal vertex, edge, and face IDs;
- directed half-edges or `(vertex, edge, face)` chambers;
- cyclic order around every face and vertex;
- reciprocal adjacency across every edge;
- polygon side counts.

Validate that every supported edge has two incident faces, all cycles close, twins are reciprocal, and the incidence graph is connected. Geometry may be used for discovery only.

## Phase 4: Build and reduce the finite periodic symbol

Status: Implemented as a colored chamber quotient and maximal translation reduction, verified by the hash-scoped Cargo tests (2026-08-13).

Use the periodic data to identify equivalent chambers and close a finite quotient. Populate its three chamber involutions and face labels, then validate reciprocal involutions, edge incidence, vertex links, connectivity, and torus Euler characteristic.

A non-primitive construction may produce a translation cover of the desired quotient. Find additional translations by verifying their action on every quotient face, refine the lattice, and repeat until the maximal translation quotient is reached so primitive and enlarged fundamental regions yield the same result.

Failure to prove closure must remain an error; no fixed repetition count participates in identity.

## Phase 5: Canonicalize and encode inside `Hash`

Status: Implemented and verified by the hash-scoped Cargo tests (2026-08-13).

Canonicalize the finite chamber graph independently of IDs and traversal order:

1. traverse from every possible root chamber;
2. preserve only the three incidence colors, so a global reflection is naturally an isomorphism;
3. assign IDs in first-visit order;
4. serialize attributes and involution targets in a fixed order;
5. choose the lexicographically smallest byte sequence.

Keep the authoritative canonical bytes private inside `Hash`. Prefix them with a format and policy version, then derive the displayed `th1:<hex>` value from domain-separated SHA-256.

Changing canonical byte semantics requires a version change.

## Phase 6: Verify the algorithm

Status: Complete for the native hash implementation and current checked-in catalogue (2026-08-13). Compilation of the library, colocated tests, native WASM consumer, and `wasm32-unknown-unknown` WASM consumer succeeds. All 72 generator tests pass, including 23 hash-scoped tests, with no failures or ignored tests. The shared geometry suite also passes all 34 tests after introducing `Affine2` and `Vector2` and routing point, line-segment, polygon, tile, and plane transforms through them. Locally, set `INSTA_WORKSPACE_ROOT` to the repository root so the snapshot harness does not launch a nested Cargo metadata process that Santa blocks.

The completed focused unit coverage beside the `hash/` source files includes:

- all 24 chamber renumberings of the small reference symbol;
- same-labelled non-isomorphic symbols remaining distinct;
- deterministic traversal;
- primitive-cover reduction;
- typed failure for malformed and incomplete quotients;
- an exact version-1 canonical byte vector and its exact `th1` digest.

Runtime native/WASM string parity remains a consumer integration follow-up; the WASM target currently has compile-time coverage without adding a second public hash API solely for testing. Any future canonical byte change requires a new format version. Do not preserve outputs from the removed hash.

## Phase 7: Integrate and migrate

Status: Complete for the checked-in catalogue artifacts; live datastore/searcher migration is deferred until the searcher is intentionally resumed.

The public call sites and datastore field remain unchanged, but values produced by the removed hash algorithm must not be mixed with `th1` values.

The repeatable `backfill-output-hashes` Rust command now:

- reads the existing `results/output.json` catalogue in its current order;
- rebuilds each notation at three repetitions and explicitly calls `Plane::create_hash()`;
- validates the displayed `th1:<64 lowercase hex>` shape;
- aborts before writing if two current catalogue entries produce the same canonical hash;
- preserves the current schema's existing row metadata and writes matching JSON and CSV artifacts.

The current 257 rows were backfilled successfully. Every row has a valid `th1` value, no hash occurs twice, and a second run produced byte-identical JSON and CSV. This intentionally rehashes the curated catalogue without adding candidates from `valid_tilings.txt`; missing tilings can be discovered by a later searcher run after the new identity has been accepted.

- do not resume searcher/backfill writes until the behavior suite has run successfully;
- reset or backfill the live datastore to one explicit algorithm version before resuming searcher writes;
- retain the format version in the displayed value or stored metadata;
- verify digest collisions against canonical bytes during the deferred live datastore migration tooling;
- never treat an incomplete-hash failure as an empty hash.

## Definition of done

The work is complete when:

- `Hash::build(&Plane) -> Hash` remains the hashing entry point;
- all hashing implementation details live under `src/hash/`;
- equalities and inequalities are covered by direct Rust tests;
- generator, seed, coordinate frame, repetition count, reflection, and fundamental-region choice do not change the hash;
- globally different tilings with identical local vocabularies remain distinct;
- every successful hash comes from a proved-complete finite periodic quotient;
- the canonical format is deterministic and versioned;
- unsupported cases fail visibly rather than receiving an empty or sampled identity;
- checked-in catalogue hashes are rebuilt, and live stored hashes are reset or rebuilt before datastore catalogue deduplication resumes.
