import { useWasmContext } from '@hogg/common';
import * as tilingParser from '@hogg/tiling-parser';
import * as tilingRenderer from '@hogg/tiling-renderer';
import { Options, Tiling, Transform } from '../../types';

function parseNotation(notation: string): Tiling {
  return tilingParser.parse_notation(notation);
}

function parseTransform(transform: string, path: string): Transform {
  return tilingParser.parse_transform(transform, path);
}

function renderNotation(
  notation: string,
  canvasId: string,
  options?: Options
): Tiling {
  return tilingRenderer.render_notation(notation, canvasId, options);
}

export const wasmApi = {
  parseNotation,
  parseTransform,
  renderNotation,
};

export type WasmApi = typeof wasmApi;

export default function useWasmApi() {
  return useWasmContext<WasmApi>();
}
