declare module 'incremental-convex-hull' {
  export type Vector = [number, number, number];

  export default function(points: number[][]): Vector[];
}
