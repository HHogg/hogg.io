import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg';

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

function isBidirectional(sequence: Sequence): boolean {
  return wasm.is_bidirectional(sequence);
}

function length(sequence: Sequence): number {
  return wasm.length(sequence);
}

function min(sequence: Sequence): Sequence {
  return wasm.min(sequence);
}

function toString(sequences: Sequence[]): string {
  return wasm.to_string(sequences);
}

function sort(sequences: Sequence[]): Sequence[] {
  return wasm.sort(sequences);
}

export const wasmApi = {
  isBidirectional,
  length,
  min,
  toString,
  sort,
};

export type WasmApi = typeof wasmApi;

export default function useWasmApi() {
  return useWasmContext<WasmApi>();
}
