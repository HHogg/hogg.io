import { useWasmApi } from '@hogg/wasm';
import { Box, BoxProps, Text } from 'preshape';
import { forwardRef, useEffect, useRef } from 'react';

export type CanvasProps = {
  uid: string;
  error?: string;
  height: number;
  width: number;
};

const Canvas = forwardRef<HTMLDivElement, BoxProps & CanvasProps>(
  function CanvasInner({ error, height, uid, width, ...rest }, ref) {
    const refCanvas = useRef<HTMLCanvasElement>(null);
    const refCanvasTransferred = useRef<boolean>(false);
    const { api } = useWasmApi();

    // Transfer the canvas to the worker
    useEffect(() => {
      if (refCanvas.current && !refCanvasTransferred.current) {
        const offscreenCanvas = refCanvas.current.transferControlToOffscreen();

        refCanvasTransferred.current = true;
        api.tilings.transferCanvas([uid, offscreenCanvas], [offscreenCanvas]);
      }
    }, [api, uid]);

    return (
      <Box {...rest} flex="vertical" grow height={height}>
        <Box basis="0" container grow ref={ref}>
          <Box
            absolute="edge-to-edge"
            id={uid}
            ref={refCanvas}
            tag="canvas"
            style={{
              height: `${height}px`,
              width: `${width}px`,
              transformOrigin: 'top left',
            }}
          ></Box>

          {error && (
            <Box absolute="center" maxWidth="300px">
              <Text
                align="middle"
                size="x3"
                textColor="negative-shade-4"
                weight="x2"
              >
                {error}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

export default Canvas;
