import * as React from 'react';
import { Base } from 'preshape';
import shuffle from 'lodash.shuffle';
import Renderer from './Renderer';
import { Geometry } from './getGeometry';

interface Props {
  height: number;
  width: number;
}

const TOTAL_CHANGE_SECONDS = 1;

const getGridSize = (w: number, h: number): [number, number, number] => {
  return [3, 3, 9];

  let c = 0;
  let r = 0;

  if (w < 1600) c = 4;
  if (w < 1400) c = 3;
  if (w < 1200) c = 2;
  if (w < 1000) c = 1;
  if (h < 1600) r = 4;
  if (h < 1400) r = 3;
  if (h < 1200) r = 2;
  if (h < 1000) r = 1;

  return [c, r, c * r];
};

const RorschachVisual = (props: Props) => {
  const { height, width } = props;
  const [geometries, setGeometries] = React.useState<[Geometry | null, number][]>([]);
  const refCanvas = React.useRef<HTMLCanvasElement>(null);
  const refGridSize = React.useRef<[number, number, number]>([0, 0, 0]);
  const refNextIndex = React.useRef<number>(0);
  const refOrder = React.useRef<number[]>([]);
  const refRenderer = React.useRef<Renderer>();
  const refWorker = React.useRef<Worker>();
  const refCount = React.useRef(0);

  const handleUpdateGeometries = (geometry: Geometry) => {
    setGeometries((geometries) => {
      const nextPosition = refOrder.current[refNextIndex.current++ % refGridSize.current[2]];
      const currentGeometries = geometries.slice(-refGridSize.current[2]);
      return [...currentGeometries, [geometry, nextPosition]];
    });
  };

  React.useEffect(() => {
    if (!refWorker.current) {
      refWorker.current = new Worker('./GeometryWorker.js');
      refWorker.current.onmessage = ({ data }) => handleUpdateGeometries(data);
    }

    if (refCanvas.current && !refRenderer.current) {
      refRenderer.current = new Renderer(refCanvas.current);
      refRenderer.current?.setDimensions(width, height);
    }

    return () => {
      refWorker.current?.terminate();
      refRenderer.current?.destroy();
    };
  }, []);

  React.useLayoutEffect(() => {
    refGridSize.current = getGridSize(width, height);
    refCanvas.current?.setAttribute('height', `${height * devicePixelRatio}`);
    refCanvas.current?.setAttribute('width', `${width * devicePixelRatio}`);
    refRenderer.current?.setDimensions(width, height);

    refOrder.current = shuffle(Array
      .from({ length: refGridSize.current[2] })
      .map((_, i) => i));

    setGeometries(Array
      .from({ length: refGridSize.current[2] })
      .map((_, i) => [null, refOrder.current[i]]));

    const interval = setInterval(() => {
      if (refCount.current < 9) {
        refCount.current++;
        refWorker.current?.postMessage({});
      }
    }, 1000 * (TOTAL_CHANGE_SECONDS / refGridSize.current[2]));

    return () => {
      window.clearInterval(interval);
    };
  }, [height, width]);

  React.useEffect(() => {
    refRenderer.current?.setGeometries(geometries, refGridSize.current);
  }, [geometries]);

  return (
    <Base
        absolute="edge-to-edge"
        height={ height }
        ref={ refCanvas }
        tag="canvas"
        width={ width } />
  );
};

export default RorschachVisual;
