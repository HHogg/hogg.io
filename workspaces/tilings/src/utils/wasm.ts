import * as tilingParser from '@hogg/tiling-parser';
import * as tilingRenderer from '@hogg/tiling-renderer';
import { Options, Tiling, Transform } from '../types';

let initPromise: Promise<void> | null = null;

export function initWasm() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = Promise.all([
    tilingRenderer.default(),
    tilingParser.default(),
  ]).then(() => Promise.resolve());

  return initPromise;
}

export function parseNotation(notation: string): Tiling {
  return tilingParser.parse_notation(notation);
}

export function parseTransform(transform: string, path: string): Transform {
  return tilingParser.parse_transform(transform, path);
}

export function renderNotation(
  notation: string,
  canvasId: string,
  options?: Options
): Tiling {
  return tilingRenderer.render_notation(notation, canvasId, options);
}
