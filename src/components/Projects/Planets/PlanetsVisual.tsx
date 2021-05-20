import * as React from 'react';
import { Base } from 'preshape';
import Renderer from './Renderer';
import { ConfigDrawMode } from './Planets';

interface Props {
  drawMode: ConfigDrawMode;
  height: number;
  width: number;
}

const PlanetsVisual = (props: Props) => {
  const { drawMode, height, width } = props;
  const refCanvas = React.useRef<HTMLCanvasElement>(null);
  const refRenderer = React.useRef<Renderer>();

  React.useLayoutEffect(() => {
    if (refCanvas.current && !refRenderer.current) {
      refRenderer.current = new Renderer(refCanvas.current);
    }

    return () => {
      refRenderer.current?.destroy();
    };
  }, []);

  React.useLayoutEffect(() => {
    refCanvas.current?.setAttribute('height', `${height * devicePixelRatio}`);
    refCanvas.current?.setAttribute('width', `${width * devicePixelRatio}`);
    refRenderer.current?.setDimensions(width, height);
  }, [height, width]);

  React.useEffect(() => {
    refRenderer.current?.setDrawMode(drawMode);
  }, [drawMode]);

  return (
    <Base
        absolute="edge-to-edge"
        height={ height }
        ref={ refCanvas }
        tag="canvas"
        width={ width } />
  );
};

export default PlanetsVisual;
