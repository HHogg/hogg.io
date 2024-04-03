import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg/line_segment_extending';

export type X1Y1X2Y2 = [number, number, number, number];

function getExtendedLineSegment(
  lineSegment: X1Y1X2Y2,
  bounds: X1Y1X2Y2,
  extendStart: boolean,
  extendEnd: boolean
): X1Y1X2Y2 {
  return wasm.get_extended_line_segment(
    lineSegment,
    bounds,
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
