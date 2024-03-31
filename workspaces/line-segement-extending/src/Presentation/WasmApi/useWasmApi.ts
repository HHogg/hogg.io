import { useWasmContext } from '@hogg/common';
import { BBox, LineSegment } from '@hogg/geometry';
import * as wasm from '../../../pkg/line_segment_extending';

function getExtendedLineSegment(
  bbox: BBox,
  lineSegment: LineSegment,
  extendStart: boolean,
  extendEnd: boolean
): LineSegment {
  return wasm.get_extended_line_segment(
    bbox,
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
