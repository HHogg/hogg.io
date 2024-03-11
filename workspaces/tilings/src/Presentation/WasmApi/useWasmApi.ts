import { useWasmContext } from '@hogg/common';
import * as tilingParser from '@hogg/tiling-parser';
import * as tilingRenderer from '@hogg/tiling-renderer';
import { Options, Tiling, Transform, ValidationFlag } from '../../types';

function parseNotation(notation: string): Tiling {
  return tilingParser.parse_notation(notation);
}

function parseTransform(transform: string, path: string): Transform {
  return tilingParser.parse_transform(transform, path);
}

function renderNotation(
  canvasId: string,
  notation: string,
  options?: Options,
  validations: ValidationFlag[] = [
    ValidationFlag.Overlaps,
    ValidationFlag.Gaps,
    ValidationFlag.Expansion,
    ValidationFlag.VertexTypes,
    ValidationFlag.EdgeTypes,
    ValidationFlag.ShapeTypes,
  ]
): Tiling {
  return tilingRenderer.render_notation(
    notation,
    canvasId,
    options,
    validations
  );
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
