import { type X1Y1X2Y2 } from '@hogg/line-segment-extending/types';
import { get_extended_line_segment as _getExtendedLineSegment } from '@hogg/wasm/pkg';

export const getExtendedLineSegment = (
  lineSegment: X1Y1X2Y2,
  bounds: X1Y1X2Y2,
  extendStart: boolean,
  extendEnd: boolean
) => _getExtendedLineSegment(lineSegment, bounds, extendStart, extendEnd);
