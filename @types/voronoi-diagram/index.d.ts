declare module 'voronoi-diagram' {
  export type Vector = [number, number, number];

  export default function(points: Vector[]): {
    cells: number[][];
    positions: Vector[];
  };
}
