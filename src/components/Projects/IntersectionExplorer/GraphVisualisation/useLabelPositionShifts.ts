import { useLayoutEffect, useRef, useState } from 'react';
import * as SAT from 'sat';
import { FermatSpiral } from '../../Spirals/Algorithms';
import { Circle, Graph } from '../useGraph';

const PADDING = 3;
const MAX_SEARCH_AREA = 200;

interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface XY {
  dx: number;
  dy: number;
  x: number,
  y: number,
}

const points = FermatSpiral(500).map(([x, y]) => [
  x * MAX_SEARCH_AREA,
  y * MAX_SEARCH_AREA,
]);

/**
 * Converts a DOMRect to a Sat Polygon
 */
const rectToPoly = (
  { x, y, width, height }: Rect,
  { x: shiftX, y: shiftY }: XY = { dx: 0, dy: 0, x: 0, y: 0 },
  padding = 0,
): SAT.Polygon => {
  return new SAT.Box(
    new SAT.Vector(x - padding + shiftX, y - padding + shiftY),
    width + padding * 2,
    height + padding * 2,
  ).toPolygon();
};

/**
 * Tests if a shifted DOMRect collides with a list of other DOMRects (which may contain )
 */
const hasCollidedRect = (
  aRect: Rect,
  shift: undefined | XY,
  rects: Rect[],
  shifts: XY[] = []
): boolean => {
  for (let b = 0; b < rects.length; b++) {
    const bRect = rects[b];

    if (aRect && bRect && aRect !== bRect) {
      const aPoly = rectToPoly(aRect, shift, PADDING);
      const bPoly = rectToPoly(bRect, shifts[b], PADDING);

      if (SAT.testPolygonPolygon(aPoly, bPoly)) {
        return true;
      }
    }
  }

  return false;
};

/**
 *
 */
const hasCollidedCircle = (
  aRect: Rect,
  shift: undefined | XY,
  circles: Circle[],
): boolean => {
  if (aRect) {
    const aPoly = rectToPoly(aRect, shift);

    for (let c = 0; c < circles.length; c++) {
      const { radius, x, y } = circles[c];

      const innerResponse = new SAT.Response();

      SAT.testPolygonCircle(aPoly, new SAT.Circle(new SAT.Vector(x, y), radius + PADDING), innerResponse);
      const hasOuterCollided = SAT.testPolygonCircle(aPoly, new SAT.Circle(new SAT.Vector(x, y), radius - PADDING));

      if (!innerResponse.aInB && hasOuterCollided) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Gets a shifted X/Y value that puts the label into a position with
 * no collisions... hopefully.
 */
const getLabelShift = (
  rect: Rect,
  labels: Rect[],
  obstacles: Rect[],
  shifts: XY[],
  circles: Circle[],
): XY => {
  if (rect) {
    const dx = rect.width * -0.5;
    const dy = rect.height * -0.5;

    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];

      const shift = {
        dx: dx,
        dy: dy,
        x: x + dx,
        y: y + dy,
      };

      if (
          !hasCollidedRect(rect, shift, labels, shifts) && // Collision with other labels
          !hasCollidedRect(rect, shift, obstacles) && // Collision with nodes
          !hasCollidedCircle(rect, shift, circles) // Collision with edges
      ) {
        return shift;
      }
    }
  }

  return {
    dx: 0,
    dy: 0,
    x: 0,
    y: 0,
  };
};

/**
 *
 */
const useLabelPositionShifts = (
  graph: Graph,
  labelsElement: SVGGElement | null,
  obstaclesElement: SVGGElement | null,
): XY[] => {
  const { circles, edges, nodes } = graph;
  const [shifts, setShifts] = useState<XY[]>([]);
  const refTimeout = useRef(0);

  useLayoutEffect(() => {
    window.clearTimeout(refTimeout.current);
    refTimeout.current = window.setTimeout(() => {
      const shifts: XY[] = [];

      if (labelsElement && obstaclesElement) {
        const labelBounds = Array
          .from(labelsElement.children)
          .map((labelElement, index) => {
            const boundingElement = labelElement.querySelector('[data-bounding-element]');
            const height = boundingElement?.clientHeight || 0;
            const width = boundingElement?.clientWidth || 0;
            const { x, y } = nodes[index] || edges[index - nodes.length] || { x: 0, y: 0 };
            return { x, y, width, height };
          });

        const obstacleBounds = Array
          .from(obstaclesElement.children as unknown as SVGGElement[])
          .map((obstacleElement) => {
            const { height, width, x, y } = obstacleElement.getBBox();
            return { x, y, width, height };
          });

        for (let i = 0; i < labelBounds.length; i++) {
          shifts.push(getLabelShift(
            labelBounds[i],
            labelBounds,
            obstacleBounds,
            shifts,
            circles,
          ));
        }
      }

      setShifts(shifts);
    }, 1000);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles]);

  // console.log(shifts);

  return shifts;
};

export default useLabelPositionShifts;
