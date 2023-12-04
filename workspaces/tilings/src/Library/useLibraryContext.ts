import { createContext, useContext } from 'react';
import { TilingResult, results } from '../utils/results';

const FILTER_KEYS = [
  'has_0',
  'has_3',
  'has_4',
  'has_6',
  'has_8',
  'has_12',
] as const;

export type FilterKeys = (typeof FILTER_KEYS)[number];
export type LibraryFilters = Record<FilterKeys, boolean>;
export type LibraryResultCounts = Record<FilterKeys, number>;

export type LibraryContextProps = {
  countsByShapes: LibraryResultCounts;
  filteredResults: TilingResult[];
  filteredResultsByUniform: Record<string, TilingResult[]>;
  filters: LibraryFilters;
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
  results: TilingResult[],
  filters: LibraryFilters
): TilingResult[] => {
  if (Object.values(filters).every((value) => !value)) {
    return results;
  }

  return results.filter((result) => {
    return (
      Object.entries(filters)
        // .filter(([, selected]) => selected)
        .every(([key, value]) => {
          return result[key as keyof TilingResult] === value;
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
        .every(([key]) => result[key as keyof TilingResult]);

      if (!matches) {
        continue;
      }
    }

    for (const key of FILTER_KEYS) {
      if (result[key as keyof TilingResult]) {
        counts[key]++;
      }
    }
  }

  return counts;
};

const noop = () => {};

export const defaultContext = {
  countsByShapes: defaultResultsCounts,
  filteredResults: [],
  filteredResultsByUniform: {},
  filters: defaultFilters,
  toggleFilter: noop,
};

export const LibraryContext =
  createContext<LibraryContextProps>(defaultContext);

export const useLibraryContext = () => useContext(LibraryContext);
