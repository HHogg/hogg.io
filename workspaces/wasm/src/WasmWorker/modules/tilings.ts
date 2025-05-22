import {
  parse_transform as _parseTransform,
  find_previous_tiling as _findPreviousTiling,
  find_next_tiling as _findNextTiling,
  render_tiling as _renderTiling,
  TilingsPlayer,
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
  repetitions: number,
  featureToggles?: Record<FeatureToggle, boolean>,
  options?: Options
) {
  const canvas = canvases.get(id);

  if (!canvas) {
    throw new Error(`Canvas with id ${id} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  _renderTiling(canvas, notation, repetitions, featureToggles, options);
}

export function parseTransform(transform: string, path: string): Transform {
  return _parseTransform(transform, path);
}

export function findPreviousTiling(
  notation: string,
  repetitions: number,
  featureToggles?: Record<FeatureToggle, boolean>
): string | undefined {
  return _findPreviousTiling(notation, repetitions, featureToggles);
}

export function findNextTiling(
  notation: string,
  repetitions: number,
  featureToggles?: Record<FeatureToggle, boolean>
): string | undefined {
  return _findNextTiling(notation, repetitions, featureToggles);
}

// Player related functions
let player: TilingsPlayer | null = null;

export function startPlayer(uid: string) {
  if (player !== null) {
    return;
  }

  const canvas = canvases.get(uid);

  if (!canvas) {
    throw new Error(`Canvas with id ${uid} not found`);
  }

  player = new TilingsPlayer();
  player.set_canvas(canvas);
  player.start();
}

export function stopPlayer() {
  if (player === null) {
    return;
  }

  player.stop();
  player = null;
}

export function setPlayerCanvasSize(
  uid: string,
  width: number,
  height: number
) {
  if (player === null) {
    return;
  }

  const canvas = canvases.get(uid);

  if (!canvas) {
    throw new Error(`Canvas with id ${uid} not found`);
  }

  canvas.width = width;
  canvas.height = height;

  player.set_dimensions(width, height);
}

export function setPlayerRepetitions(repetitions: number) {
  if (player === null) {
    return;
  }

  player.set_repetitions(repetitions);
}

export function setPlayerFeatureToggles(
  featureToggles: Record<FeatureToggle, boolean>
) {
  if (player === null) {
    return;
  }

  player.set_feature_toggles(featureToggles);
}

export function setPlayerNotation(notation: string) {
  if (player === null) {
    return;
  }

  player.set_notation(notation);
}

export function setPlayerRenderOptions(options: Options) {
  if (player === null) {
    return;
  }

  player.set_render_options(options);
}

export function setPlayerSpeed(speed: number) {
  if (player === null) {
    return;
  }

  player.set_speed(speed);
}

export function controlPlayerPlay() {
  if (player === null) {
    return;
  }

  player.play();
}

export function controlPlayerPause() {
  if (player === null) {
    return;
  }

  player.pause();
}

export function controlPlayerStepForward() {
  if (player === null) {
    return;
  }

  player.step_forward();
}

export function controlPlayerStepBackward() {
  if (player === null) {
    return;
  }

  player.step_backward();
}

export function controlPlayerToStart() {
  if (player === null) {
    return;
  }

  player.to_start();
}

export function controlPlayerToEnd() {
  if (player === null) {
    return;
  }

  player.to_end();
}
