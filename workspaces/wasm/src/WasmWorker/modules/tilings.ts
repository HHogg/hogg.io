import {
  parse_notation as _parseNotation,
  parse_transform as _parseTransform,
  find_previous_tiling as _findPreviousTiling,
  find_next_tiling as _findNextTiling,
  generate_tiling as _generateTiling,
  render_tiling as _renderTiling,
} from '@hogg/wasm/pkg';
import { Flag, Metrics, Options, Tiling, Transform } from '../../types';

const defaultValidations: Flag[] = [
  Flag.Overlaps,
  Flag.Gaps,
  Flag.Expanded,
  Flag.VertexTypes,
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
  expansionPhases: number,
  validations = defaultValidations
): string | undefined {
  return _findPreviousTiling(notation, expansionPhases, validations);
}

export function findNextTiling(
  notation: string,
  expansionPhases: number,
  validations = defaultValidations
): string | undefined {
  return _findNextTiling(notation, expansionPhases, validations);
}

export function generateTiling(
  notation: string,
  expansionPhases: number,
  validations = defaultValidations
): Tiling {
  return _generateTiling(notation, expansionPhases, validations);
}

export function renderTiling(
  id: string,
  tiling: Tiling,
  width: number,
  height: number,
  options?: Options
): Metrics {
  const canvas = canvases.get(id);

  if (!canvas) {
    throw new Error(`Canvas with id ${id} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  return _renderTiling(canvas, tiling, options);
}
