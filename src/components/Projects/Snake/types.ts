export type TypeCell = [number, number];

export type TypePath = TypeCell[];
export type TypePoint = TypeCell;
export type TypeSnake = TypeCell[];
export type TypeValues = number[][];

export interface Environment {
  path: TypePath;
  point: undefined | TypePoint;
  snake: TypeSnake;
}

export type TypeHistory = Environment[];

export interface TypeSolution {
  name: string;
  content: string;
}

export interface TypeSolutionWithScore extends TypeSolution {
  average: number;
  points: number;
  score: number;
}
