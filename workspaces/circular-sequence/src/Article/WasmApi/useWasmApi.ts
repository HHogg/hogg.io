import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg/circular_sequence';

export type Sequence = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

function isSymmetrical(sequence: Sequence): boolean {
  return wasm.is_symmetrical(sequence);
}

function getLength(sequence: Sequence): number {
  return wasm.get_length(sequence);
}

function getMinPermutation(sequence: Sequence): Sequence {
  return wasm.get_min_permutation(sequence);
}

function getSymmetryIndex(sequence: Sequence): number | undefined {
  return wasm.get_symmetry_index(sequence);
}

function toString(sequences: Sequence[]): string {
  return wasm.to_string(sequences);
}

function sort(sequences: Sequence[]): Sequence[] {
  return wasm.sort(sequences);
}

export const wasmApi = {
  isSymmetrical,
  getLength,
  getMinPermutation,
  getSymmetryIndex,
  toString,
  sort,
};

export type WasmApi = typeof wasmApi;

export default function useWasmApi() {
  return useWasmContext<WasmApi>();
}
