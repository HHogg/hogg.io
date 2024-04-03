import { useWasmContext } from '@hogg/common';
import * as wasm from '../../../pkg/tiling_wasm';
import { Options, Tiling, Transform, ValidationFlag } from '../../types';

const defaultValidations: ValidationFlag[] = [
  ValidationFlag.Overlaps,
  ValidationFlag.Gaps,
  ValidationFlag.Expansion,
  ValidationFlag.VertexTypes,
  ValidationFlag.EdgeTypes,
  ValidationFlag.ShapeTypes,
];

function parseNotation(notation: string): Tiling {
  return wasm.parse_notation(notation);
}

function parseTransform(transform: string, path: string): Transform {
  return wasm.parse_transform(transform, path);
}

function findPreviousTiling(
  notation: string,
  validations = defaultValidations
): string | undefined {
  return wasm.find_previous_tiling(notation, validations);
}

function findNextTiling(
  notation: string,
  validations = defaultValidations
): string | undefined {
  return wasm.find_next_tiling(notation, validations);
}

function renderNotation(
  canvasId: string,
  notation: string,
  options?: Options,
  validations = defaultValidations
): Tiling {
  return wasm.render_notation(notation, canvasId, options, validations);
}

export const wasmApi = {
  parseNotation,
  parseTransform,
  findPreviousTiling,
  findNextTiling,
  renderNotation,
};

export type WasmApi = typeof wasmApi;

export default function useWasmApi() {
  return useWasmContext<WasmApi>();
}
