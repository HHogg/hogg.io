import { useWasmApi } from '@hogg/wasm';
import { useResizeObserver } from 'preshape';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { X1Y1X2Y2 } from '../types';
import {
  BoundFlag,
  LineSegmentContext,
  LineSegmentContextValue,
} from './useLineSegmentContext';

const padding = 0.1;

export default function LineSegmentProvider({ children }: PropsWithChildren) {
  const refSvgContainer = useRef<SVGSVGElement>(null);
  const [
    { height: containerHeight, width: containerWidth },
    refDimensionContainer,
  ] = useResizeObserver<HTMLDivElement>();

  const {
    api: {
      lineSegmentExtending: { getExtendedLineSegment },
    },
  } = useWasmApi();
  const [bounds, setBounds] = useState<LineSegmentContextValue['bounds']>([
    0, 0, 0, 0,
  ]);
  const [[x1, y1], setPoints1] = useState([0, 0]);
  const [[x2, y2], setPoints2] = useState([0, 0]);
  const [extendStart, setExtendStart] = useState(true);
  const [extendEnd, setExtendEnd] = useState(true);
  const [animate, setAnimate] = useState(false);

  const [showBounds, setShowBounds] = useState<BoundFlag[]>([]);
  const [showLineSegment, setShowLineSegment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const lineSegment = useMemo<X1Y1X2Y2>(
    () => [x1, y1, x2, y2],
    [x1, x2, y1, y2]
  );

  const [extendedLineSegmentToContainer, setExtendedLineSegmentToContainer] =
    useState<X1Y1X2Y2 | null>(null);
  const [extendedLineSegmentToBounds, setExtendedLineSegmentToBounds] =
    useState<X1Y1X2Y2 | null>(null);

  // Clamps the points to the bounds of the container
  const handleSetPoints1 = useCallback(
    ([x, y]: [number, number]) => {
      setPoints1([
        Math.min(Math.max(x, bounds[0]), bounds[2]),
        Math.min(Math.max(y, bounds[1]), bounds[3]),
      ]);
    },
    [bounds]
  );

  const handleSetPoints2 = useCallback(
    ([x, y]: [number, number]) => {
      setPoints2([
        Math.min(Math.max(x, bounds[0]), bounds[2]),
        Math.min(Math.max(y, bounds[1]), bounds[3]),
      ]);
    },
    [bounds]
  );

  useEffect(() => {
    const x1 = Math.round(containerWidth * padding);
    const y1 = Math.round(containerHeight * padding);
    const x2 = Math.round(containerWidth * (1 - padding));
    const y2 = Math.round(containerHeight * (1 - padding));

    const boundsWidth = x2 - x1;
    const boundsHeight = y2 - y1;

    const defaultXPadding = boundsWidth * 0.35;
    const defaultYPadding = boundsHeight * 0.25;

    setBounds([x1, y1, x2, y2]);
    setPoints1([x1 + defaultXPadding, y1 + defaultYPadding]);
    setPoints2([x2 - defaultXPadding, y2 - defaultYPadding]);

    setShowLineSegment(true);
    setShowBounds([
      BoundFlag.TOP,
      BoundFlag.RIGHT,
      BoundFlag.LEFT,
      BoundFlag.BOTTOM,
    ]);
  }, [containerHeight, containerWidth]);

  useEffect(() => {
    getExtendedLineSegment([
      lineSegment,
      [0, 0, containerWidth, containerHeight],
      extendStart,
      extendEnd,
    ]).then(setExtendedLineSegmentToContainer);
  }, [
    containerHeight,
    containerWidth,
    extendEnd,
    extendStart,
    getExtendedLineSegment,
    lineSegment,
  ]);

  useEffect(() => {
    getExtendedLineSegment([lineSegment, bounds, extendStart, extendEnd]).then(
      setExtendedLineSegmentToBounds
    );
  }, [
    showBounds,
    bounds,
    extendEnd,
    extendStart,
    getExtendedLineSegment,
    lineSegment,
  ]);

  const value = {
    animate,
    bounds,
    boundsHeight: bounds[3] - bounds[1],
    boundsWidth: bounds[2] - bounds[0],
    containerHeight,
    containerWidth,
    extendEnd,
    extendStart,
    extendedLineSegmentToContainer,
    extendedLineSegmentToBounds,
    refDimensionContainer,
    refSvgContainer,
    setAnimate,
    setExtendEnd,
    setExtendStart,
    setPoints1: handleSetPoints1,
    setPoints2: handleSetPoints2,
    setShowBounds,
    setShowLineSegment,
    setShowSettings,
    showBounds,
    showLineSegment,
    showSettings,
    x1,
    x2,
    y1,
    y2,
  };

  return (
    <LineSegmentContext.Provider value={value}>
      {children}
    </LineSegmentContext.Provider>
  );
}
