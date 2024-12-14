export type Cell = [number, number];

type Path = Cell[];
export type Point = Cell;
export type Snake = Cell[];
export type Values = number[][];

export type HistoryBlock = {
  path: Path;
  point: Point | null;
  snake: Snake;
};

export type History = HistoryBlock[];

export type Solution = {
  name: string;
  content: string;
};
