import {
  type Options,
  type Tiling,
  type Transform,
  ValidationFlag,
} from '@hogg/tilings/types';
import {
  parse_notation as _parseNotation,
  parse_transform as _parseTransform,
  find_previous_tiling as _findPreviousTiling,
  find_next_tiling as _findNextTiling,
  render_notation as _renderNotation,
} from '@hogg/wasm/pkg';

const defaultValidations: ValidationFlag[] = [
  ValidationFlag.Overlaps,
  ValidationFlag.Gaps,
  ValidationFlag.Expansion,
  ValidationFlag.VertexTypes,
  ValidationFlag.EdgeTypes,
  ValidationFlag.ShapeTypes,
];

const canvases = new Map<string, OffscreenCanvas>();

export function transferCanvas(id: string, canvas: OffscreenCanvas): void {
  canvases.set(id, canvas);
}

export function parseNotation(notation: string): Tiling {
  return _parseNotation(notation);
}

export function parseTransform(transform: string, path: string): Transform {
  return _parseTransform(transform, path);
}

export function findPreviousTiling(
  notation: string,
  validations = defaultValidations
): string | undefined {
  return _findPreviousTiling(notation, validations);
}

export function findNextTiling(
  notation: string,
  validations = defaultValidations
): string | undefined {
  return _findNextTiling(notation, validations);
}

export function renderNotation(
  id: string,
  notation: string,
  width: number,
  height: number,
  options?: Options,
  validations = defaultValidations
): Tiling {
  const canvas = canvases.get(id);

  if (!canvas) {
    throw new Error(`Canvas with id ${id} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  return _renderNotation(canvas, notation, options, validations);
}
