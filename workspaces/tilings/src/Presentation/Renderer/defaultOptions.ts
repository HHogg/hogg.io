import {
  ThemeColorMap,
  colorNegativeShade4,
  colorNegativeShade3,
} from 'preshape';
import { ColorMode, Layer, Options, ScaleMode } from '../../types';

type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>;
};

export const defaultExpansionPhases = 5;

export const defaultOptions: Pick<
  NoUndefinedField<Options>,
  | 'autoRotate'
  | 'colorMode'
  | 'padding'
  | 'scaleMode'
  | 'scaleSize'
  | 'showLayers'
> = {
  autoRotate: false,
  colorMode: ColorMode.VaporWave,
  padding: 10,
  scaleMode: ScaleMode.WithinBounds,
  scaleSize: 10,
  showLayers: {
    [Layer.Axis]: false,
    [Layer.BoundingBoxes]: false,
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
      strokeColor: colorNegativeShade3,
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
