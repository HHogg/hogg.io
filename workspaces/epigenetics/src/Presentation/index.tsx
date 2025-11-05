import { ProjectWindow } from '@hogg/common';
import { Box, Text, useResizeObserver } from 'preshape';
import { useCallback, useRef, useState } from 'react';
import { useCanvasDimensions } from './useCanvasDimensions';
import { useCanvasTransfer } from './useCanvasTransfer';
import { useWorkers } from './useWorkers';

const Presentation = ({}: {}) => {
  const [size, refSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const refCanvasTransferred = useRef<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Initialize workers and shared buffer
  const sharedBuffer = useWorkers({ onError: handleError });

  // Transfer canvas to render worker when ready and dimensions are available
  // This also starts the render loop once everything is ready
  useCanvasTransfer({
    width,
    height,
    canvasRef: refCanvas,
    isTransferred: refCanvasTransferred,
    sharedBuffer,
  });

  // Handle canvas dimension updates
  useCanvasDimensions({
    width,
    height,
    canvasRef: refCanvas,
    isTransferred: refCanvasTransferred,
  });

  return (
    <ProjectWindow padding="x0">
      <Box flex="vertical" grow ref={refSize}>
        <Box basis="0" container grow>
          <Box
            absolute="edge-to-edge"
            ref={refCanvas}
            tag="canvas"
            style={{
              height: `${height || 400}px`,
              width: `${width || 400}px`,
              transformOrigin: 'top left',
            }}
          />

          {error && (
            <Box absolute="center" maxWidth="300px">
              <Text
                align="middle"
                padding="x3"
                textColor="negative-shade-4"
                weight="x2"
              >
                {error}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </ProjectWindow>
  );
};

export default Presentation;
