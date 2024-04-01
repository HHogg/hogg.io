import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg/line_segment_extending';

function getExtendedLineSegment(
  bounds: [number, number, number, number],
  lineSegment: [number, number, number, number],
  extendStart: boolean,
  extendEnd: boolean
): [number, number, number, number] {
  return wasm.get_extended_line_segment(
    bounds,
    lineSegment,
    extendStart,
    extendEnd
  );
}

export const wasmApi = {
  getExtendedLineSegment,
};

export type WasmApi = typeof wasmApi;

export default function useWasmApi() {
  return useWasmContext<WasmApi>();
}
