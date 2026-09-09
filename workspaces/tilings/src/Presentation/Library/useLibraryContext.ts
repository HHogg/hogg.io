import { createContext, useContext } from 'react';
import { OutputResult, results } from '../utils/results';

export const GROUP_KEYS = ['seed', 'types'] as const;

export const FILTER_KEYS = [
  'has_3',
  'has_4',
  'has_6',
  'has_8',
  'has_12',
  'vertex_types',
  'edge_types',
  'shape_types',
] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];
export type GroupKeys = (typeof GROUP_KEYS)[number];
export type LibraryFilters = Record<FilterKey, boolean>;
export type LibraryResultCounts = Record<FilterKey, number>;

export type LibraryContextProps = {
  countsByShapes: LibraryResultCounts;
  filteredResults: OutputResult[];
  filteredResultsByGroup: Record<string, OutputResult[]>;
  filters: LibraryFilters;
  groupBy: GroupKeys;
  setGroupBy: (groupBy: GroupKeys) => void;
  toggleFilter: (filter: keyof LibraryFilters) => void;
};

export const defaultResultsCounts = FILTER_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: 0 }),
  {} as LibraryResultCounts
);

export const defaultFilters = FILTER_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {} as LibraryFilters
);

export const getFilteredResults = (
  results: OutputResult[],
  filters: LibraryFilters
): OutputResult[] => {
  if (Object.values(filters).every((value) => !value)) {
    return results;
  }

  return results.filter((result) => {
    return (
      Object.entries(filters)
        // .filter(([, selected]) => selected)
        .every(([key, value]) => {
          return result[key as FilterKey] === value;
        })
    );
  });
};

export const getCountsByShapes = (
  filters: LibraryFilters
): LibraryResultCounts => {
  const counts: LibraryResultCounts = { ...defaultResultsCounts };
  const hasFilters = Object.values(filters).some((value) => value);

  for (const result of results) {
    if (hasFilters) {
      // There are filters, if this result matches the selected filters,
      // then we increase all the counts
      const matches = Object.entries(filters)
        .filter(([, selected]) => selected)
        .every(([key]) => result[key as keyof OutputResult]);

      if (!matches) {
        continue;
      }
    }

    for (const key of FILTER_KEYS) {
      if (result[key as keyof OutputResult]) {
        counts[key]++;
      }
    }
  }

  return counts;
};

const noop = () => {};

export const defaultContext: LibraryContextProps = {
  countsByShapes: defaultResultsCounts,
  filteredResults: [],
  filteredResultsByGroup: {},
  filters: defaultFilters,
  groupBy: 'types',
  setGroupBy: noop,
  toggleFilter: noop,
};

export const LibraryContext =
  createContext<LibraryContextProps>(defaultContext);

export const useLibraryContext = () => useContext(LibraryContext);
