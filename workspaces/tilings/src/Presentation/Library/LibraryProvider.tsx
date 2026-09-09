import { PropsWithChildren, useMemo, useState } from 'react';
import {
  groupResultsBySeed,
  groupResultsByTypes,
  results,
} from '../utils/results';
import {
  GroupKeys,
  LibraryContext,
  LibraryFilters,
  defaultContext,
  getCountsByShapes,
  getFilteredResults,
} from './useLibraryContext';

export default function LibraryProvider({ children }: PropsWithChildren) {
  const [groupBy, setGroupBy] = useState<GroupKeys>('types');
  const [filters, setFilters] = useState<LibraryFilters>(
    defaultContext.filters
  );

  const filteredResults = useMemo(
    () => getFilteredResults(results, filters),
    [filters]
  );

  const filteredResultsByGroup = useMemo(() => {
    switch (groupBy) {
      case 'seed':
        return groupResultsBySeed(filteredResults);
      case 'types':
        return groupResultsByTypes(filteredResults);
      default:
        throw new Error(`Invalid group key: ${groupBy}`);
    }
  }, [filteredResults, groupBy]);

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
        filteredResultsByGroup,
        groupBy,
        setGroupBy,
        toggleFilter,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}
