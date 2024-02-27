import { Canvas } from '@hogg/canvas';
import {
  BoxProps,
  colorBlack,
  colorNegativeShade4,
  useThemeContext,
} from 'preshape';
import { useCallback, useMemo } from 'react';
import { ColorMode, Options, ValidationFlag } from '../../types';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import useWasmApi from '../WasmApi/useWasmApi';

export type RendererProps = {
  options?: Partial<Options>;
  scale?: number;
  shadow?: boolean;
  validations?: ValidationFlag[];
};

export default function RendererContent({
  options: optionsProp,
  scale,
  shadow,
  validations,
  ...rest
}: BoxProps & RendererProps) {
  const { colors: themeColors } = useThemeContext();
  const { renderNotation } = useWasmApi();
  const { notation } = useNotationContext();
  const { setTiling } = useArrangementContext();
  const {
    autoRotate,
    expansionPhases,
    colorMode,
    maxStage,
    scaleMode,
    scaleSize,
    showAnnotations,
    showDebug,
  } = usePlayerContext();

  const options = useMemo<Options>(
    () => ({
      autoRotate,
      colorMode,
      expansionPhases,
      maxStage,
      showAnnotations,
      showDebug,
      padding: 10,
      scaleMode,
      scaleSize,
      ...optionsProp,
      styles: {
        axis: {
          fill: themeColors.colorTextShade1,
          lineThickness: 3,
          pointRadius: 6,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 2,
          ...optionsProp?.styles?.axis,
        },
        debug: {
          strokeColor: colorNegativeShade4,
          strokeWidth: 2,
          ...optionsProp?.styles?.debug,
        },
        shape: {
          fill: themeColors.colorTextShade1,
          strokeColor:
            (optionsProp?.colorMode ?? colorMode) === ColorMode.None
              ? themeColors.colorBackgroundShade1
              : colorBlack,
          strokeWidth: 3,
          ...optionsProp?.styles?.shape,
        },
        transformContinuous: {
          chevronSize: 12,
          fill: themeColors.colorTextShade1,
          lineDash: [20, 30],
          lineThickness: 4,
          pointRadius: 12,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 3,
          ...optionsProp?.styles?.transformContinuous,
        },
        transformEccentric: {
          chevronSize: 12,
          fill: themeColors.colorTextShade1,
          lineDash: [20, 30],
          lineThickness: 4,
          pointRadius: 12,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 3,
          ...optionsProp?.styles?.transformEccentric,
        },
        vertexType: {
          pointRadius: 6,
          strokeColor: themeColors.colorBackgroundShade1,
          strokeWidth: 2,
          ...optionsProp?.styles?.vertexType,
        },
      },
    }),
    [
      autoRotate,
      expansionPhases,
      colorMode,
      optionsProp,
      maxStage,
      scaleMode,
      scaleSize,
      showAnnotations,
      showDebug,
      themeColors,
    ]
  );

  const canvasRender = useCallback(
    (id: string) => {
      setTiling(renderNotation(notation, id, options, validations));
    },
    [setTiling, notation, options, validations, renderNotation]
  );

  return (
    <Canvas {...rest} scale={scale} shadow={shadow} render={canvasRender} />
  );
}
