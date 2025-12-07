struct Uniforms {
  width: u32,
  height: u32,
  cell_size: u32,
  genotype_size: u32,
  phenotype_size: u32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> phenotype_weights: array<f32>;

struct FragmentInput {
  @builtin(position) fragCoord: vec4<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  // Convert pixel coordinates to cell coordinates
  let pixel_x = u32(input.fragCoord.x);
  let pixel_y = u32(input.fragCoord.y);
  let cell_x = pixel_x / u.cell_size;
  let cell_y = pixel_y / u.cell_size;
  let cell_width = u.width / u.cell_size;
  let cell_index = cell_x + cell_y * cell_width;
  let phenotype_offset = cell_index * u.phenotype_size;

  // Each 1/3 of the phenotype weights are used to render a different color.
  let phenotype_chunk_size = u.phenotype_size / 3u;
  let phenotype_remainder = u.phenotype_size % 3u;

  let c1_offset = phenotype_offset;
  let c2_offset = phenotype_offset + phenotype_chunk_size - phenotype_remainder;
  let c3_offset = phenotype_offset + phenotype_chunk_size * 2u - phenotype_remainder;

  return vec4<f32>(
    get_color_for_phenotype_chunk(c1_offset, phenotype_chunk_size + phenotype_remainder),
    get_color_for_phenotype_chunk(c2_offset, phenotype_chunk_size + phenotype_remainder),
    get_color_for_phenotype_chunk(c3_offset, phenotype_chunk_size + phenotype_remainder),
    1.0
  );
}

fn get_color_for_phenotype_chunk(phenotype_offset: u32, phenotype_chunk_size: u32) -> f32 {
  var color = 0.0;
  var phenotype_index: u32 = 0u;

  for (var phenotype_index: u32 = 0; phenotype_index < phenotype_chunk_size; phenotype_index++) {
    let phenotype_weight = phenotype_weights[phenotype_offset + phenotype_index];
    color = color + phenotype_weight;
  }

  return color / f32(phenotype_chunk_size);
}
