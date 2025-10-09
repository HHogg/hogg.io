import { describe, it, expect } from 'vitest';
import { Circle, Line, Rect, Obstacle } from '../types';
import { hasCollided } from './hasCollided';

describe('hasCollided', () => {
  describe('Circle vs Line collisions', () => {
    it('should detect collision when circle center is at line start point', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 0, y: 0, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should detect collision when circle center is at line end point', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 100, y: 0, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should detect collision when circle overlaps with line', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 50, y: 0, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should detect collision when circle is near line but not touching', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 50, y: 1, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should NOT detect collision when circle is far from line', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 50, y: 20, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(false);
    });

    it('should handle vertical lines', () => {
      const line: Line = { x1: 0, y1: 0, x2: 0, y2: 100 };
      const circle: Circle = { x: 0, y: 50, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should handle diagonal lines', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 100 };
      const circle: Circle = { x: 50, y: 50, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should handle zero-length lines (degenerate case)', () => {
      const line: Line = { x1: 50, y1: 50, x2: 50, y2: 50 };
      const circle: Circle = { x: 50, y: 50, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });
  });

  describe('Circle vs Circle collisions', () => {
    it('should detect collision when circles overlap', () => {
      const circle1: Circle = { x: 0, y: 0, radius: 10 };
      const circle2: Circle = { x: 5, y: 0, radius: 10 };
      const obstacle: Obstacle<Circle> = {
        id: 'test-circle',
        type: 'solid',
        geometry: circle2,
        padding: 2,
      };

      const result = hasCollided(circle1, [obstacle]);
      expect(result).toBe(true);
    });

    it('should NOT detect collision when circles are separate', () => {
      const circle1: Circle = { x: 0, y: 0, radius: 10 };
      const circle2: Circle = { x: 50, y: 0, radius: 10 };
      const obstacle: Obstacle<Circle> = {
        id: 'test-circle',
        type: 'solid',
        geometry: circle2,
        padding: 2,
      };

      const result = hasCollided(circle1, [obstacle]);
      expect(result).toBe(false);
    });
  });

  describe('Circle vs Rect collisions', () => {
    it('should detect collision when circle overlaps with rectangle', () => {
      const circle: Circle = { x: 25, y: 25, radius: 10 };
      const rect: Rect = { x: 0, y: 0, width: 50, height: 50 };
      const obstacle: Obstacle<Rect> = {
        id: 'test-rect',
        type: 'solid',
        geometry: rect,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should NOT detect collision when circle is outside rectangle', () => {
      const circle: Circle = { x: 100, y: 100, radius: 10 };
      const rect: Rect = { x: 0, y: 0, width: 50, height: 50 };
      const obstacle: Obstacle<Rect> = {
        id: 'test-rect',
        type: 'solid',
        geometry: rect,
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(false);
    });
  });

  describe('Rect vs Line collisions', () => {
    it('should detect collision when rectangle intersects with line', () => {
      const rect: Rect = { x: 45, y: -5, width: 10, height: 10 };
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(rect, [obstacle]);
      expect(result).toBe(true);
    });

    it('should NOT detect collision when rectangle is far from line', () => {
      const rect: Rect = { x: 45, y: 20, width: 10, height: 10 };
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 2,
      };

      const result = hasCollided(rect, [obstacle]);
      expect(result).toBe(false);
    });
  });

  describe('Line vs Line collisions', () => {
    it('should detect collision when lines intersect', () => {
      const line1: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const line2: Line = { x1: 50, y1: -10, x2: 50, y2: 10 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line2,
        padding: 2,
      };

      const result = hasCollided(line1, [obstacle]);
      expect(result).toBe(true);
    });

    it('should NOT detect collision when lines are parallel and separate', () => {
      const line1: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const line2: Line = { x1: 0, y1: 20, x2: 100, y2: 20 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line2,
        padding: 2,
      };

      const result = hasCollided(line1, [obstacle]);
      expect(result).toBe(false);
    });
  });

  describe('Multiple obstacles', () => {
    it('should detect collision with any obstacle in the list', () => {
      const circle: Circle = { x: 25, y: 25, radius: 5 };
      const obstacles: Obstacle[] = [
        {
          id: 'line1',
          type: 'solid',
          geometry: { x1: 0, y1: 0, x2: 50, y2: 0 },
          padding: 2,
        },
        {
          id: 'line2',
          type: 'solid',
          geometry: { x1: 0, y1: 0, x2: 0, y2: 50 },
          padding: 2,
        },
      ];

      const result = hasCollided(circle, obstacles);
      expect(result).toBe(true);
    });

    it('should return false when no obstacles collide', () => {
      const circle: Circle = { x: 100, y: 100, radius: 5 };
      const obstacles: Obstacle[] = [
        {
          id: 'line1',
          type: 'solid',
          geometry: { x1: 0, y1: 0, x2: 50, y2: 0 },
          padding: 2,
        },
        {
          id: 'line2',
          type: 'solid',
          geometry: { x1: 0, y1: 0, x2: 0, y2: 50 },
          padding: 2,
        },
      ];

      const result = hasCollided(circle, obstacles);
      expect(result).toBe(false);
    });
  });

  describe('Obstacle types', () => {
    it('should handle bounds type obstacles', () => {
      const circle: Circle = { x: 25, y: 25, radius: 5 };
      const obstacle: Obstacle<Rect> = {
        id: 'bounds',
        type: 'bounds',
        geometry: { x: 0, y: 0, width: 50, height: 50 },
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(false); // Circle is inside bounds, so no collision
    });

    it('should handle outline type obstacles', () => {
      const circle: Circle = { x: 25, y: 25, radius: 5 };
      const obstacle: Obstacle<Rect> = {
        id: 'outline',
        type: 'outline',
        geometry: { x: 0, y: 0, width: 50, height: 50 },
        padding: 2,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(false); // Circle is inside outline, so no collision
    });
  });

  describe('Edge cases', () => {
    it('should handle empty obstacles array', () => {
      const circle: Circle = { x: 0, y: 0, radius: 5 };
      const result = hasCollided(circle, []);
      expect(result).toBe(false);
    });

    it('should handle very small padding', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 0, y: 0, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 0.1,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });

    it('should handle large padding', () => {
      const line: Line = { x1: 0, y1: 0, x2: 100, y2: 0 };
      const circle: Circle = { x: 0, y: 0, radius: 5 };
      const obstacle: Obstacle<Line> = {
        id: 'test-line',
        type: 'solid',
        geometry: line,
        padding: 20,
      };

      const result = hasCollided(circle, [obstacle]);
      expect(result).toBe(true);
    });
  });
});
