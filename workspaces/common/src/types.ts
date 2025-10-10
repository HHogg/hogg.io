export enum ProjectKey {
  // External link projects start with an _
  _preshape = 'preshape',

  circle_art = 'circle-art',
  circle_intersections = 'circle-intersections',
  circular_sequence = 'circular-sequence',
  grahams_scan = 'grahams-scan',
  epigenetics = 'epigenetics',
  line_segment_extending = 'line-segment-extending',
  snake = 'snake',
  spatial_grid_map = 'spatial-grid-map',
  spirals = 'spirals',
  tilings = 'tilings',
  tilings_validate_gaps = 'tilings-validate-gaps',
  tilings_validate_overlaps = 'tilings-validate-overlaps',
  tilings_validate_vertex_types = 'tilings-validate-vertex-types',
  wasm = 'wasm',
}

export type Project = {
  id: ProjectKey;
  name: string;
  description: string;
  created: string;
  updated: string;
  image?: string;
  tags: string[];
  href?: string;
  deploy?: boolean;
  wip?: boolean;
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Given an object type `TObj`, returns a union of all
 * nested keys in dot-notation (e.g. "nested.details.author").
 */
export type NestedKeyOf<TObj extends object> = {
  [K in keyof TObj & string]: TObj[K] extends (...args: any[]) => any // If it's a function, treat as leaf:
    ? K
    : // If it's an array, treat as leaf:
    TObj[K] extends any[]
    ? K
    : // If it's an object, recurse:
    TObj[K] extends object
    ? `${K}.${NestedKeyOf<TObj[K]>}`
    : // Otherwise (string, number, boolean, etc.), leaf:
      K;
}[keyof TObj & string];

/**
 * Given an object type `TObj` and a path `TPath` in dot-notation (e.g. "nested.details.author"),
 * returns the type at that path or `never` if it doesn't exist.
 */
export type PropertyAtPath<
  TObj,
  TPath extends string
> = TPath extends `${infer Head}.${infer Tail}`
  ? Head extends keyof TObj
    ? PropertyAtPath<TObj[Head], Tail>
    : never
  : TPath extends keyof TObj
  ? TObj[TPath]
  : never;

/**
 * Recursively map over a nested type, wrapping each leaf node in a Promise.
 */
export type WrapNestedFunctionsInPromise<T> = T extends (...args: any[]) => any
  ? (args: Parameters<T>, transfer?: Transferable[]) => Promise<ReturnType<T>>
  : T extends object
  ? {
      [K in keyof T]: WrapNestedFunctionsInPromise<T[K]>;
    }
  : never;
