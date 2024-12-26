import { Options, ColorPalette, ScaleMode, Layer, ColorMode } from '@hogg/wasm';
import { ThemeColorMap, colorNegativeShade4 } from 'preshape';

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
};

export const defaultExpansionPhases = 4;

export const defaultOptions: Pick<
  NoUndefinedField<Options>,
  'autoRotate' | 'colorMode' | 'colorPalette' | 'scaleMode' | 'showLayers'
> = {
  autoRotate: true,
  colorMode: ColorMode.Stage,
  colorPalette: ColorPalette.VaporWave,
  scaleMode: ScaleMode.Contain,
  showLayers: {
    [Layer.Axis]: false,
    [Layer.BoundingBoxes]: false,
    [Layer.ConvexHull]: false,
    [Layer.GridLineSegment]: false,
    [Layer.GridPolygon]: false,
    [Layer.PlaneOutline]: false,
    [Layer.ShapeBorder]: true,
    [Layer.ShapeFill]: true,
    [Layer.Transform]: false,
    [Layer.TransformPoints]: false,
  },
};

export const getDefaultOptionsWithStyles = (
  themeColors: ThemeColorMap
): Options => ({
  ...defaultOptions,
  styles: {
    axis: {
      fill: colorNegativeShade4,
      lineDash: [window.devicePixelRatio * 6, window.devicePixelRatio * 6],
      lineThickness: window.devicePixelRatio,
      pointRadius: window.devicePixelRatio * 4,
      shadowBlur: window.devicePixelRatio * 5,
      shadowColor: 'rgba(10, 10, 10, 0.4)',
      strokeColor: themeColors.colorBackgroundShade1,
      strokeWidth: window.devicePixelRatio,
    },
    boundingBoxes: {
      strokeColor: colorNegativeShade4,
      lineDash: [window.devicePixelRatio * 3, window.devicePixelRatio * 3],
      strokeWidth: window.devicePixelRatio,
    },
    grid: {
      opacity: 0.4,
      fill: themeColors.colorBackgroundShade2,
      strokeColor: themeColors.colorAccentShade3,
      strokeWidth: window.devicePixelRatio,
    },
    planeOutline: {
      strokeColor: themeColors.colorTextShade1,
      strokeWidth: window.devicePixelRatio * 1.5,
    },
    shape: {
      fill: themeColors.colorTextShade1,
      strokeColor: themeColors.colorBackgroundShade1,
      strokeWidth: window.devicePixelRatio,
    },
    transformContinuous: {
      chevronSize: window.devicePixelRatio * 6,
      fill: themeColors.colorTextShade1,
      lineDash: [20, 30],
      lineThickness: window.devicePixelRatio * 2,
      pointRadius: window.devicePixelRatio * 4,
      shadowBlur: window.devicePixelRatio * 5,
      shadowColor: 'rgba(10, 10, 10, 0.4)',
      strokeColor: themeColors.colorBackgroundShade1,
      strokeWidth: window.devicePixelRatio,
    },
    transformEccentric: {
      chevronSize: window.devicePixelRatio * 6,
      fill: themeColors.colorTextShade1,
      lineDash: [20, 30],
      lineThickness: window.devicePixelRatio * 2,
      pointRadius: window.devicePixelRatio * 4,
      shadowBlur: window.devicePixelRatio * 5,
      shadowColor: 'rgba(10, 10, 10, 0.4)',
      strokeColor: themeColors.colorBackgroundShade1,
      strokeWidth: window.devicePixelRatio,
    },
    transformPoints: {
      pointRadius: window.devicePixelRatio * 3,
      strokeColor: themeColors.colorBackgroundShade1,
      strokeWidth: window.devicePixelRatio,
    },
  },
});
