import * as React from 'react';
import { mat3 } from 'gl-matrix';
import regl from 'regl';
import BezierEasing from 'bezier-easing';
import { transitionTimingFunction, Base } from 'preshape';
import { TypeVector } from './Algorithms';
import useStateTween from './useStateTween';
import frag from './frag.glsl';
import vert from './vert.glsl';

interface Props {
  height: number;
  vectors: TypeVector[];
  width: number;
}

const ease = new BezierEasing(...transitionTimingFunction);
const duration = 2000;

const SpiralsVisual = (props: Props) => {
  const { height, vectors, width } = props;
  const refCanvas = React.useRef<HTMLCanvasElement>(null);
  const regFrameLoop = React.useRef<regl.Cancellable>();
  const refRegl = React.useRef<regl.Regl>();
  const refStartTime = React.useRef<number | null>(null);
  const refT = React.useRef<number>(0);
  const state = useStateTween(refT.current, vectors);

  React.useLayoutEffect(() => {
    if (refCanvas.current && !refRegl.current) {
      refRegl.current = regl({ canvas: refCanvas.current });
    }

    return () => {
      refRegl.current?.destroy();
    };
  }, []);

  React.useEffect(() => {
    refCanvas.current?.setAttribute('height', `${height * 2}`);
    refCanvas.current?.setAttribute('width', `${width * 2}`);

    if (regFrameLoop.current) {
      refStartTime.current = null;
      regFrameLoop.current.cancel();
    }

    if (refRegl.current) {
      const buffers: Record<string, regl.Buffer | undefined> = {
        'a_vector_0': refRegl.current?.buffer(state[0]),
        'a_vector_1': refRegl.current?.buffer(state[1]),
      };

      regFrameLoop.current = refRegl.current.frame(({ time }) => {
        if (refRegl.current) {
          if (refStartTime.current === null) {
            refStartTime.current = time;
          }

          refT.current = Math.min(ease((time - refStartTime.current) / (duration / 1000)), 1);

          refRegl.current.clear({ depth: 1 });

          refRegl.current({
            frag: frag,
            vert: vert,
            count: state[0].length,
            primitive: 'points',
            attributes: buffers,
            uniforms: {
              /* eslint-disable @typescript-eslint/camelcase */
              u_projection: mat3.projection(mat3.create(), width, height),
              u_t: refT.current,
              /* eslint-enable @typescript-eslint/camelcase */
            },
          })();

          if (refT.current >= 1) {
            refStartTime.current = null;

            if (regFrameLoop.current) {
              regFrameLoop.current.cancel();
              regFrameLoop.current = undefined;
            }
          }
        }
      });
    }
  }, [state, height, width]);

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
