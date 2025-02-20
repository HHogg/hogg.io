import { Ref, RefObject, createContext, useContext } from 'react';
import { X1Y1X2Y2 } from '../types';

const defaultLineSegment: X1Y1X2Y2 = [0, 0, 0, 0];

export enum BoundFlag {
  TOP = 'Top',
  RIGHT = 'Right',
  BOTTOM = 'Bottom',
  LEFT = 'Left',
}

export type LineSegmentContextValue = {
  animate: boolean;
  bounds: X1Y1X2Y2;
  boundsHeight: number;
  boundsWidth: number;
  containerHeight: number;
  containerWidth: number;
  extendEnd: boolean;
  extendStart: boolean;
  extendedLineSegmentToBounds: X1Y1X2Y2 | null;
  extendedLineSegmentToContainer: X1Y1X2Y2 | null;
  refDimensionContainer: Ref<HTMLDivElement>;
  refSvgContainer: RefObject<SVGSVGElement>;
  setAnimate: (animate: boolean) => void;
  setExtendEnd: (extendEnd: boolean) => void;
  setExtendStart: (extendStart: boolean) => void;
  setPoints1: (points: [number, number]) => void;
  setPoints2: (points: [number, number]) => void;
  setShowBounds: (showBounds: LineSegmentContextValue['showBounds']) => void;
  setShowLineSegment: (showLineSegment: boolean) => void;
  setShowSettings: (showSettings: boolean) => void;
  showBounds: BoundFlag[];
  showLineSegment: boolean;
  showSettings: boolean;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export const LineSegmentContext = createContext<LineSegmentContextValue>({
  animate: false,
  bounds: [0, 0, 0, 0],
  boundsHeight: 0,
  boundsWidth: 0,
  containerHeight: 0,
  containerWidth: 0,
  extendEnd: true,
  extendStart: true,
  extendedLineSegmentToBounds: defaultLineSegment,
  extendedLineSegmentToContainer: defaultLineSegment,
  refDimensionContainer: { current: null },
  refSvgContainer: { current: null },
  setAnimate: () => {},
  setExtendEnd: () => {},
  setExtendStart: () => {},
  setPoints1: () => {},
  setPoints2: () => {},
  setShowBounds: () => {},
  setShowLineSegment: () => {},
  setShowSettings: () => {},
  showBounds: [],
  showLineSegment: false,
  showSettings: false,
  x1: 0,
  x2: 0,
  y1: 0,
  y2: 0,
});

export const useLineSegmentContext = () => {
  return useContext(LineSegmentContext);
};
