export type Face = [number, number, number];
export type Vert = [number, number, number];

export interface Icosahedron {
  heights: number[];
  faces: Face[];
  norms: Vert[];
  verts: Vert[];
}
