import { mat3 } from 'gl-matrix';
import { Box, useThemeContext } from 'preshape';
import { useEffect, useRef } from 'react';
import regl from 'regl';
import frag from './shader.frag?raw';
import vert from './shader.vert?raw';
import useGetRotationalTheta from './useRotationalTheta';
import useTransitionT from './useTransitionT';
import { Point, useSpiralsContext } from '.';

type Props = {
  height: number;
  width: number;
};

const SpiralsVisual = ({ height, width }: Props) => {
  const { theme } = useThemeContext();
  const { colors, points } = useSpiralsContext();
  const getRotationalTheta = useGetRotationalTheta();
  const { transitionT, updateTransitionT, resetTransitionT } = useTransitionT();

  const xSize = width;
  const ySize = height;

  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refFrameLoop = useRef<regl.Cancellable>();
  const refRegl = useRef<regl.Regl>();

  const refPointsA = useRef<Point[]>(points);
  const refPointsB = useRef<Point[]>(points);
  const refPointCount = useRef<number>(0);

  const refProjection = useRef(mat3.create());

  const refBuffers = useRef<Record<string, regl.Buffer | undefined>>({});

  useEffect(() => {
    if (refCanvas.current && !refRegl.current) {
      refRegl.current = regl({ canvas: refCanvas.current });

      refFrameLoop.current = refRegl.current.frame(({ time }) => {
        if (refRegl.current) {
          updateTransitionT(time);

          refRegl.current.clear({ depth: 1 });

          refRegl.current({
            frag: frag,
            vert: vert,
            count: refPointCount.current,
            primitive: 'points',
            attributes: refBuffers.current,
            uniforms: {
              u_projection: refProjection.current,
              u_device_pixel_ratio: window.devicePixelRatio,
              u_transition_time: transitionT.current,
              u_rotation_theta: getRotationalTheta(transitionT.current, time),
            },
          })();
        }
      });
    }

    return () => {
      refRegl.current?.destroy();
      refRegl.current = undefined;
      refFrameLoop.current = undefined;
    };
  }, [getRotationalTheta, updateTransitionT, transitionT]);

  useEffect(() => {
    refCanvas.current?.setAttribute(
      'height',
      `${ySize * window.devicePixelRatio}`
    );

    refCanvas.current?.setAttribute(
      'width',
      `${xSize * window.devicePixelRatio}`
    );

    mat3.projection(
      refProjection.current,
      (xSize / xSize) * 2,
      (ySize / xSize) * 2
    );
  }, [xSize, ySize]);

  useEffect(() => {
    if (refRegl.current && theme === 'night') {
      refBuffers.current.a_color = refRegl.current.buffer(colors);
    } else {
      refBuffers.current.a_color = refRegl.current?.buffer(
        colors.map(() => [0, 0, 0])
      );
    }
  }, [colors, theme]);

  /**
   * In this effect, we take the previous points (A,B) and
   * assign A to the progress between the 2 given refTimeTransition.
   * B is always the target targets.
   */
  useEffect(() => {
    if (refRegl.current) {
      refPointCount.current = points.length;

      if (transitionT.current === 1) {
        refPointsA.current = refPointsB.current;
      } else {
        const nextPointsA: Point[] = [];

        for (let i = 0; i < points.length; i++) {
          const pointA = refPointsA.current[i] || [0, 0, 0];
          const pointB = refPointsB.current[i] || [0, 0, 0];

          nextPointsA.push([
            pointA[0] + (pointB[0] - pointA[0]) * transitionT.current,
            pointA[1] + (pointB[1] - pointA[1]) * transitionT.current,
          ]);
        }

        refPointsA.current = nextPointsA;
      }

      refPointsB.current = points;

      refBuffers.current.a_point_a = refRegl.current.buffer(refPointsA.current);
      refBuffers.current.a_point_b = refRegl.current.buffer(refPointsB.current);

      resetTransitionT();
    }
  }, [points, resetTransitionT, transitionT]);

  return (
    <Box absolute="edge-to-edge" alignChildren="middle" flex="vertical">
      <Box height={ySize} ref={refCanvas} tag="canvas" width={xSize} />
    </Box>
  );
};

export default SpiralsVisual;
