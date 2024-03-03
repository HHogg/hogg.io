import { Canvas } from '@hogg/canvas';
import {
  Box,
  BoxProps,
  sizeX1Px,
  sizeX2Px,
  sizeX3Px,
  useResizeObserver,
  useThemeContext,
  colorNegativeShade4,
  borderSizeX2Px,
} from 'preshape';
import { useCallback, useMemo } from 'react';
import { Options } from '../../types';
import useWasmApi, { Sequence } from '../WasmApi/useWasmApi';

type Props = BoxProps & {
  sequence: Sequence;
  shadow?: boolean;
};

export default function RendererSequence({ sequence, shadow, ...rest }: Props) {
  const { colors } = useThemeContext();
  const [{ width }, ref] = useResizeObserver();
  const { render } = useWasmApi();

  const options = useMemo<Options>(
    () => ({
      // showDebug: true,
      padding: 40,
      styles: {
        debug: {
          strokeColor: colorNegativeShade4,
          strokeWidth: borderSizeX2Px,
        },
        arc: {
          chevronSize: sizeX3Px,
          fill: colors.colorTextShade1,
          lineThickness: sizeX2Px,
          strokeColor: colors.colorBackgroundShade1,
          strokeWidth: sizeX1Px,
        },
        text: {
          fill: colors.colorTextShade1,
          fontFamily: 'Noto Sans',
          fontSize: 64,
          fontWeight: 'bold',
          textAlignHorizontal: 'center',
          textAlignVertical: 'middle',
        },
      },
    }),
    [colors]
  );

  const canvasRender = useCallback(
    (id: string) => {
      render(id, sequence, options);
    },
    [sequence, options, render]
  );

  return (
    <Box
      {...rest}
      container
      flex="vertical"
      height={width}
      overflow="hidden"
      ref={ref}
      textColor="text-shade-1"
    >
      <Canvas render={canvasRender} shadow={shadow} />
    </Box>
  );
}
