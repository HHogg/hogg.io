declare module 'simplicial-complex' {
  type Point = [number, number, number];
  type Cell = [number, number, number, number];

  export function skeleton(points: Point[], n: number): Cell[];
}
