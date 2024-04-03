import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg/tiling_wasm';
import { Options, Tiling, Transform, ValidationFlag } from '../../types';

function parseNotation(notation: string): Tiling {
  return wasm.parse_notation(notation);
}

function parseTransform(transform: string, path: string): Transform {
  return wasm.parse_transform(transform, path);
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
  return wasm.render_notation(notation, canvasId, options, validations);
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
