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

export type ObstacleType = 'bounds' | 'outline';

export type Obstacle<TGeometry = Geometry> = {
  id: string;
  geometry: TGeometry;
  padding?: number;
  type?: ObstacleType;
};

export type Obstacles = Obstacle[];

export type Label = {
  id: string;
  geometry: Rect;
  padding?: number;
};
