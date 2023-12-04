// import LibraryFilters from './LibraryFilters';
import LibraryProvider from './LibraryProvider';
import LibraryResultsGrid from './LibraryResultsGrid';

export default function Library() {
  return (
    <LibraryProvider>
      {/* <LibraryFilters /> */}
      <LibraryResultsGrid />
    </LibraryProvider>
  );
}
