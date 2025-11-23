#[cfg(test)]
mod tests {
  use crate::utils::get_optimal_workgroup_size;

  #[test]
  fn test_exact_multiple_16() {
    // Perfect multiples of 16 should use 16x16
    assert_eq!(get_optimal_workgroup_size(16, 16), (16, 16));
    assert_eq!(get_optimal_workgroup_size(32, 32), (16, 16));
    assert_eq!(get_optimal_workgroup_size(64, 64), (16, 16));
    assert_eq!(get_optimal_workgroup_size(16, 32), (16, 16));
  }

  #[test]
  fn test_exact_multiple_8() {
    // Perfect multiples of 8 (but not 16) should use 8x8
    assert_eq!(get_optimal_workgroup_size(8, 8), (8, 8));
    assert_eq!(get_optimal_workgroup_size(24, 24), (8, 8));
    assert_eq!(get_optimal_workgroup_size(8, 16), (8, 8));
  }

  #[test]
  fn test_exact_multiple_4() {
    // Perfect multiples of 4 (but not 8) should use 4x4
    assert_eq!(get_optimal_workgroup_size(4, 4), (4, 4));
    assert_eq!(get_optimal_workgroup_size(12, 12), (4, 4));
  }

  #[test]
  fn test_near_16_boundary() {
    // 15x15: Both 8x8 and 16x16 have same waste (31 threads), but 16x16 wins on tie-break
    // 8x8: 2x2 workgroups = 256 threads, waste = 31
    // 16x16: 1x1 workgroups = 256 threads, waste = 31
    assert_eq!(get_optimal_workgroup_size(15, 15), (16, 16));

    // 17x17: 4x4 has less waste
    // 4x4: ceil(17/4) = 5, 5*5*4*4 = 400, waste = 400 - 289 = 111
    // 8x8: ceil(17/8) = 3, 3*3*8*8 = 576, waste = 576 - 289 = 287
    // 16x16: ceil(17/16) = 2, 2*2*16*16 = 1024, waste = 1024 - 289 = 735
    assert_eq!(get_optimal_workgroup_size(17, 17), (4, 4));
  }

  #[test]
  fn test_near_8_boundary() {
    // 7x7: 8x8 has less waste
    // 4x4: 2x2 workgroups = 64 threads, waste = 15
    // 8x8: 1x1 workgroups = 64 threads, waste = 15
    // Tie-break favors 8x8
    assert_eq!(get_optimal_workgroup_size(7, 7), (8, 8));

    // 9x9: 8x8 has less waste
    // 4x4: 3x3 workgroups = 144 threads, waste = 63
    // 8x8: 2x2 workgroups = 256 threads, waste = 175
    // Actually wait, let me recalculate:
    // 4x4: ceil(9/4) = 3, 3*3*4*4 = 144, waste = 144 - 81 = 63
    // 8x8: ceil(9/8) = 2, 2*2*8*8 = 256, waste = 256 - 81 = 175
    // So 4x4 should win
    assert_eq!(get_optimal_workgroup_size(9, 9), (4, 4));
  }

  #[test]
  fn test_rectangular_textures() {
    // Rectangular textures should work correctly
    // 16x8: 4x4 and 8x8 both have 0 waste, 8x8 wins on tie-break
    // 4x4: ceil(16/4)=4, ceil(8/4)=2, total = 4*2*4*4 = 128, waste = 0
    // 8x8: ceil(16/8)=2, ceil(8/8)=1, total = 2*1*8*8 = 128, waste = 0
    // 16x16: ceil(16/16)=1, ceil(8/16)=1, total = 1*1*16*16 = 256, waste = 128
    assert_eq!(get_optimal_workgroup_size(16, 8), (8, 8));

    // 8x16: Same as above, 8x8 wins
    assert_eq!(get_optimal_workgroup_size(8, 16), (8, 8));

    // 15x8: 8x8 has less waste
    // 4x4: ceil(15/4)=4, ceil(8/4)=2, total = 4*2*4*4 = 128, waste = 8
    // 8x8: ceil(15/8)=2, ceil(8/8)=1, total = 2*1*8*8 = 128, waste = 8
    // 16x16: ceil(15/16)=1, ceil(8/16)=1, total = 1*1*16*16 = 256, waste = 136
    // Tie-break favors 8x8
    assert_eq!(get_optimal_workgroup_size(15, 8), (8, 8));
  }

  #[test]
  fn test_small_textures() {
    // Very small textures
    assert_eq!(get_optimal_workgroup_size(1, 1), (4, 4));
    assert_eq!(get_optimal_workgroup_size(2, 2), (4, 4));
    assert_eq!(get_optimal_workgroup_size(3, 3), (4, 4));
  }

  #[test]
  fn test_large_textures() {
    // Large textures that are multiples
    assert_eq!(get_optimal_workgroup_size(256, 256), (16, 16));
    assert_eq!(get_optimal_workgroup_size(512, 512), (16, 16));
    assert_eq!(get_optimal_workgroup_size(128, 128), (16, 16));
  }

  #[test]
  fn test_odd_dimensions() {
    // Various odd dimensions
    // 31x31: 16x16 has less waste
    // 4x4: ceil(31/4) = 8, 8*8*4*4 = 1024, waste = 1024 - 961 = 63
    // 8x8: ceil(31/8) = 4, 4*4*8*8 = 1024, waste = 1024 - 961 = 63
    // 16x16: ceil(31/16) = 2, 2*2*16*16 = 1024, waste = 1024 - 961 = 63
    // Tie-break favors 16x16
    assert_eq!(get_optimal_workgroup_size(31, 31), (16, 16));

    // 33x33: 4x4 has less waste
    // 4x4: ceil(33/4) = 9, 9*9*4*4 = 1296, waste = 1296 - 1089 = 207
    // 8x8: ceil(33/8) = 5, 5*5*8*8 = 1600, waste = 1600 - 1089 = 511
    // 16x16: ceil(33/16) = 3, 3*3*16*16 = 2304, waste = 2304 - 1089 = 1215
    assert_eq!(get_optimal_workgroup_size(33, 33), (4, 4));

    // 63x63: 16x16 has less waste
    // 4x4: ceil(63/4) = 16, 16*16*4*4 = 4096, waste = 4096 - 3969 = 127
    // 8x8: ceil(63/8) = 8, 8*8*8*8 = 4096, waste = 4096 - 3969 = 127
    // 16x16: ceil(63/16) = 4, 4*4*16*16 = 4096, waste = 4096 - 3969 = 127
    // Tie-break favors 16x16
    assert_eq!(get_optimal_workgroup_size(63, 63), (16, 16));
  }

  #[test]
  fn test_waste_calculation() {
    // Test that we're actually minimizing waste
    // 20x20 texture:
    // 4x4: ceil(20/4) = 5, 5*5*4*4 = 400, waste = 400 - 400 = 0 (perfect!)
    // 8x8: ceil(20/8) = 3, 3*3*8*8 = 576, waste = 576 - 400 = 176
    // 16x16: ceil(20/16) = 2, 2*2*16*16 = 1024, waste = 1024 - 400 = 624
    // So 4x4 should win
    assert_eq!(get_optimal_workgroup_size(20, 20), (4, 4));
  }
}
