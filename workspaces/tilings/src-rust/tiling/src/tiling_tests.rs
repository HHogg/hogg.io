// use std::sync::Once;

// use insta::assert_debug_snapshot;

// use super::*;

// static SEQ_COUNT: u8 = 200; // This needs to be high enough to catch stack overflows

// static BEFORE_EACH: Once = Once::new();
// static mut NEXT_WITHOUT_TRANSFORMS: Vec<String> = vec![];
// static mut NEXT_WITH_TRANSFORMS: Vec<String> = vec![];
// static mut PREVIOUS_WITHOUT_TRANSFORMS: Vec<String> = vec![];
// static mut PREVIOUS_WITH_TRANSFORMS: Vec<String> = vec![];

// pub fn before_each() {
//   BEFORE_EACH.call_once(|| unsafe {
//     let mut tiling_without_transforms =
//       Tiling::default().with_validations(Some(validation::Flag::all()));

//     let mut tiling_with_transforms = Tiling::default()
//       .with_validations(Some(validation::Flag::all()))
//       .with_expansion_phases(3)
//       .with_link_paths()
//       .with_first_transform();

//     for _ in 0..SEQ_COUNT {
//       if let Ok(Some(next_tiling)) = tiling_without_transforms.find_next_tiling(None) {
//         NEXT_WITHOUT_TRANSFORMS.push(next_tiling.notation.to_string());
//       }

//       if let Ok(Some(next_tiling)) = tiling_with_transforms.find_next_tiling(None) {
//         NEXT_WITH_TRANSFORMS.push(next_tiling.notation.to_string());
//       }
//     }

//     PREVIOUS_WITHOUT_TRANSFORMS.push(tiling_without_transforms.notation.to_string());
//     PREVIOUS_WITH_TRANSFORMS.push(tiling_with_transforms.notation.to_string());

//     for _ in 0..SEQ_COUNT + 1 {
//       if let Ok(Some(previous_tiling)) = tiling_without_transforms.find_previous_tiling(None) {
//         PREVIOUS_WITHOUT_TRANSFORMS.push(previous_tiling.to_string());
//       }

//       if let Ok(Some(previous_tiling)) = tiling_with_transforms.find_previous_tiling(None) {
//         PREVIOUS_WITH_TRANSFORMS.push(previous_tiling.to_string());
//       }
//     }
//   });
// }

// #[test]
// fn next_sequence_without_transforms_matches_snapshot() {
//   before_each();

//   unsafe {
//     assert_debug_snapshot!(NEXT_WITHOUT_TRANSFORMS);
//   }
// }

// #[test]
// fn previous_sequence_without_transforms_matches_snapshot() {
//   before_each();

//   unsafe {
//     assert_debug_snapshot!(PREVIOUS_WITHOUT_TRANSFORMS);
//   }
// }

// #[test]
// fn next_and_previous_sequences_without_transforms_are_equal() {
//   before_each();

//   unsafe {
//     assert_eq!(
//       NEXT_WITHOUT_TRANSFORMS.len(),
//       PREVIOUS_WITHOUT_TRANSFORMS.len()
//     );

//     NEXT_WITHOUT_TRANSFORMS
//       .iter()
//       .zip(PREVIOUS_WITHOUT_TRANSFORMS.iter().rev())
//       .for_each(|(next, previous)| assert_eq!(next, previous))
//   }
// }

// #[test]
// fn next_sequence_with_transforms_matches_snapshot() {
//   before_each();

//   unsafe {
//     assert_debug_snapshot!(NEXT_WITH_TRANSFORMS);
//   }
// }

// #[test]
// fn previous_sequence_with_transforms_matches_snapshot() {
//   before_each();

//   unsafe {
//     assert_debug_snapshot!(PREVIOUS_WITH_TRANSFORMS);
//   }
// }

// #[test]
// fn next_and_previous_sequences_with_transforms_are_equal() {
//   before_each();

//   unsafe {
//     assert_eq!(NEXT_WITH_TRANSFORMS.len(), PREVIOUS_WITH_TRANSFORMS.len());

//     NEXT_WITH_TRANSFORMS
//       .iter()
//       .zip(PREVIOUS_WITH_TRANSFORMS.iter().rev())
//       .for_each(|(next, previous)| assert_eq!(next, previous))
//   }
// }

// // #[test]
// // fn build_context_contains_valid_path() {
// //   before_each();

// //   let seq_count = 20;
// //   let mut tiling = Tiling::default()
// //     .with_validations(Some(validation::Flag::all()))
// //     .with_expansion_phases(5)
// //     .with_link_paths()
// //     .with_first_transform();

// //   for _ in 0..seq_count {
// //     tiling.find_next_tiling(None);
// //   }

// //   unsafe {
// //     assert_eq!(
// //       &NEXT_WITH_TRANSFORMS[..seq_count],
// //       build_context
// //         .valid_tilings
// //         .iter()
// //         .map(|t| t.notation.clone())
// //         .collect::<Vec<_>>()
// //         .as_slice()
// //     )
// //   }
// // }
