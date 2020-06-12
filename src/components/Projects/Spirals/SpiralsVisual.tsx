import * as React from 'react';
import { mat3 } from 'gl-matrix';
import regl from 'regl';
import BezierEasing from 'bezier-easing';
import {
  transitionTimingFunction,
  transitionTimeBase,
  themes,
  Base,
} from 'preshape';
import { RootContext } from '../../Root';
import getTransitionState, { State } from './getTransitionState';
import frag from './frag.glsl';
import vert from './vert.glsl';

interface Props {
  height: number;
  positions: [number, number, number][];
  vectors: [number, number][];
  width: number;
}

const ease = new BezierEasing(...transitionTimingFunction);

const hexToVec3 = (hex: string, int = parseInt(hex.slice(1), 16)): [number, number, number] => [
  (int >> 16 & 255) / 255,
  (int >> 8 & 255) / 255,
  (int & 255) / 255,
];

const SpiralsVisual = (props: Props) => {
  const { height, positions, vectors, width } = props;
  const { theme } = React.useContext(RootContext);
  const refCanvas = React.useRef<HTMLCanvasElement>(null);
  const regFrameLoop = React.useRef<regl.Cancellable>();
  const refRegl = React.useRef<regl.Regl>();
  const refSize = React.useRef({ height, width });
  const refStartTime = React.useRef<number | null>(null);
  const refState = React.useRef<State>();
  const refTime = React.useRef<number>(1);

  const update = (prevSize: { height: number; width: number }) => {
    refSize.current = { height, width };
    refState.current = getTransitionState({
      cx: width / 2,
      cy: height / 2,
      pColor: hexToVec3(themes[theme].colorAccentShade2),
      positions: positions,
      prev: refState.current,
      t: Math.min(1, refTime.current),
      vColor: hexToVec3(themes.night.colorTextShade3),
      vectors: vectors,
    });

    if (refRegl.current) {
      const projection = mat3.projection(mat3.create(), width, height);
      const translate0 = [(prevSize.width || width) / 2, (prevSize.height || height) / 2];
      const translate1 = [width / 2, height / 2];
      const buffers = Object
        .entries(refState.current)
        .reduce((buffers, [key, values]) => ({
          ...buffers,
          [`a_${key}_0`]: (refRegl.current as regl.Regl).buffer(values[0]),
          [`a_${key}_1`]: (refRegl.current as regl.Regl).buffer(values[1]),
        }), {});

      if (regFrameLoop.current) {
        refStartTime.current = null;
        regFrameLoop.current.cancel();
      }

      regFrameLoop.current = refRegl.current.frame(({ time }) => {
        if (refStartTime.current === null) {
          refStartTime.current = time;
        }

        const e = time - refStartTime.current;

        refTime.current = Math.min(ease(e / (transitionTimeBase / 1000)), 1);

        if (refRegl.current && refState.current) {
          refRegl.current.clear({ depth: 1 });
          refRegl.current({
            frag: frag,
            vert: vert,
            count: refState.current.radius[0].length,
            primitive: 'points',
            attributes: buffers,
            uniforms: {
              /* eslint-disable @typescript-eslint/camelcase */
              u_projection: projection,
              u_t: refTime.current,
              u_translate_0: translate0,
              u_translate_1: translate1,
              /* eslint-enable @typescript-eslint/camelcase */
            },
          })();
        }

        if (e >= (transitionTimeBase / 1000)) {
          refStartTime.current = null;

          if (regFrameLoop.current) {
            regFrameLoop.current.cancel();
            regFrameLoop.current = undefined;
          }
        }
      });
    }
  };

  React.useLayoutEffect(() => {
    if (refCanvas.current && !refRegl.current) {
      refRegl.current = regl({ canvas: refCanvas.current });
    }
  }, []);

  React.useEffect(() => {
    refCanvas.current?.setAttribute('height', `${height * 2}`);
    refCanvas.current?.setAttribute('width', `${width * 2}`);

    update(refSize.current);
  }, [height, width, positions, theme, vectors]);

  return (
    <Base
        absolute="edge-to-edge"
        height={ height }
        ref={ refCanvas }
        tag="canvas"
        width={ width } />
  );
};

export default SpiralsVisual;
