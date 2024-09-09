import { type Sequence } from '@hogg/circular-sequence/types';
import {
  get_length as _getSequenceLength,
  get_min_permutation as _getMinPermutation,
  get_symmetry_index as _getSequenceSymmetryIndex,
  is_symmetrical as _isSequenceSymmetrical,
  to_string as _sequenceToString,
  sort as _sortSequence,
} from '@hogg/wasm/pkg';

export const isSequenceSymmetrical = (sequence: Sequence) =>
  _isSequenceSymmetrical(sequence);

export const getSequenceMinPermutation = (sequence: Sequence) =>
  _getMinPermutation(sequence);

export const getSequenceLength = (sequence: Sequence) =>
  _getSequenceLength(sequence);

export const getSequenceSymmetryIndex = (sequence: Sequence) =>
  _getSequenceSymmetryIndex(sequence);

export const sequenceToString = (sequences: Sequence[]) =>
  _sequenceToString(sequences);

export const sortSequence = (sequences: Sequence[]) => _sortSequence(sequences);
