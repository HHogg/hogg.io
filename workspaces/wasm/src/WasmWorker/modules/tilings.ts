import {
  parse_transform as _parseTransform,
  find_previous_tiling as _findPreviousTiling,
  find_next_tiling as _findNextTiling,
  render_tiling as _renderTiling,
  RenderLoop,
} from '@hogg/wasm/pkg';
import { FeatureToggle, Options, Transform } from '../../types';

const canvases = new Map<string, OffscreenCanvas>();

export function transferCanvas(id: string, canvas: OffscreenCanvas): void {
  canvases.set(id, canvas);
}

export function renderTiling(
  id: string,
  notation: string,
  width: number,
  height: number,
  expansionPhases: number,
  featureToggles?: Record<FeatureToggle, boolean>,
  options?: Options
) {
  const canvas = canvases.get(id);

  if (!canvas) {
    throw new Error(`Canvas with id ${id} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  _renderTiling(canvas, notation, expansionPhases, featureToggles, options);
}

export function parseTransform(transform: string, path: string): Transform {
  return _parseTransform(transform, path);
}

export function findPreviousTiling(
  notation: string,
  expansionPhases: number,
  featureToggles?: Record<FeatureToggle, boolean>
): string | undefined {
  return _findPreviousTiling(notation, expansionPhases, featureToggles);
}

export function findNextTiling(
  notation: string,
  expansionPhases: number,
  featureToggles?: Record<FeatureToggle, boolean>
): string | undefined {
  return _findNextTiling(notation, expansionPhases, featureToggles);
}

// Player related functions
let loop: RenderLoop | null = null;

export function startPlayer(uid: string) {
  if (loop !== null) {
    return;
  }

  const canvas = canvases.get(uid);

  if (!canvas) {
    throw new Error(`Canvas with id ${uid} not found`);
  }

  loop = new RenderLoop();
  loop.set_canvas(canvas);
  loop.start();
}

export function stopPlayer() {
  if (loop === null) {
    return;
  }

  loop.stop();
  loop = null;
}

export function setPlayerCanvasSize(
  uid: string,
  width: number,
  height: number
) {
  if (loop === null) {
    return;
  }

  const canvas = canvases.get(uid);

  if (!canvas) {
    throw new Error(`Canvas with id ${uid} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  loop.set_dimensions(width, height);
}

export function setPlayerExpansionPhases(expansionPhases: number) {
  if (loop === null) {
    return;
  }

  loop.set_expansion_phases(expansionPhases);
}

export function setPlayerFeatureToggles(
  featureToggles: Record<FeatureToggle, boolean>
) {
  if (loop === null) {
    return;
  }

  loop.set_feature_toggles(featureToggles);
}

export function setPlayerNotation(notation: string) {
  if (loop === null) {
    return;
  }

  loop.set_notation(notation);
}

export function setPlayerRenderOptions(options: Options) {
  if (loop === null) {
    return;
  }

  loop.set_render_options(options);
}

export function setPlayerSpeed(speed: number) {
  if (loop === null) {
    return;
  }

  loop.set_speed(speed);
}

export function controlPlayerPlay() {
  if (loop === null) {
    return;
  }

  loop.play();
}

export function controlPlayerPause() {
  if (loop === null) {
    return;
  }

  loop.pause();
}

export function controlPlayerStepForward() {
  if (loop === null) {
    return;
  }

  loop.step_forward();
}

export function controlPlayerStepBackward() {
  if (loop === null) {
    return;
  }

  loop.step_backward();
}

export function controlPlayerToStart() {
  if (loop === null) {
    return;
  }

  loop.to_start();
}

export function controlPlayerToEnd() {
  if (loop === null) {
    return;
  }

  loop.to_end();
}
