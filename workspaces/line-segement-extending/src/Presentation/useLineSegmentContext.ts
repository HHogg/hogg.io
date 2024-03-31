import { LineSegment } from '@hogg/geometry';
import { Ref, RefObject, createContext, useContext } from 'react';

const defaultLineSegment: LineSegment = {
  p1: { x: 0, y: 0 },
  p2: { x: 0, y: 0 },
};

export enum BoundFlag {
  TOP = 'Top',
  RIGHT = 'Right',
  BOTTOM = 'Bottom',
  LEFT = 'Left',
}

export type LineSegmentContextValue = {
  animate: boolean;
  bounds: [number, number, number, number];
  boundsHeight: number;
  boundsWidth: number;
  containerHeight: number;
  containerWidth: number;
  extendEnd: boolean;
  extendStart: boolean;
  extendedLineSegmentToBounds: LineSegment;
  extendedLineSegmentToContainer: LineSegment;
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
  extendEnd: false,
  extendStart: false,
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
