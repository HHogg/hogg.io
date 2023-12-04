export type Cell = [number, number];

export type Path = Cell[];
export type Point = Cell;
export type Snake = Cell[];
export type Values = number[][];

export interface HistoryBlock {
  path: Path;
  point: Point | null;
  snake: Snake;
}

export type History = HistoryBlock[];

export interface Solution {
  name: string;
  content: string;
}

export interface SolutionWithScores extends Solution {
  average: number;
  points: number;
  score: number;
}
