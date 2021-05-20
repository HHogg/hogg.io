declare module 'delaunay-triangulate' {
  export type Vector = [number, number, number];
  export type Tetrahedron = [number, number, number, number];

  export default function(points: Vector[]): Tetrahedron[];
}
