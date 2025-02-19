import { PropsWithChildren, useMemo, useState } from 'react';
import { groupResults, results } from '../utils/results';
import {
  LibraryContext,
  LibraryFilters,
  defaultContext,
  getCountsByShapes,
  getFilteredResults,
} from './useLibraryContext';

export default function LibraryProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<LibraryFilters>(
    defaultContext.filters
  );
  const filteredResults = useMemo(
    () => getFilteredResults(results, filters),
    [filters]
  );

  const filteredResultsByUniform = useMemo(
    () => groupResults(filteredResults),
    [filteredResults]
  );

  const countsByShapes = useMemo(() => getCountsByShapes(filters), [filters]);

  const toggleFilter = (filter: keyof LibraryFilters) => {
    setFilters((filters) => ({
      ...filters,
      [filter]: !filters[filter],
    }));
  };

  return (
    <LibraryContext.Provider
      value={{
        countsByShapes,
        filters,
        filteredResults,
        filteredResultsBySeed: filteredResultsByUniform,
        toggleFilter,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}
