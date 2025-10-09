export type Point = [number, number];

export type Circle = {
  radius: number;
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Geometry = Circle | Rect | Line;

export type ObstacleType = 'solid' | 'bounds' | 'outline';

export type Obstacle<TGeometry = Geometry> = {
  id: string;
  geometry: TGeometry;
  padding?: number;
  shift?: Point;
  type: ObstacleType;
};

export type Obstacles = Obstacle[];

export type Label = {
  id: string;
  height: number;
  width: number;
  padding?: number;
  offsetX: number;
  offsetY: number;
  targetX: number;
  targetY: number;
};
