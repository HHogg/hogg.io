import LibraryFilters from './LibraryFilters';
import LibraryProvider from './LibraryProvider';
import LibraryResultsGrid from './LibraryResultsGrid';

export type LibraryProps = {
  size?: string;
};

export default function Library({ size = '140px' }: LibraryProps) {
  return (
    <LibraryProvider>
      <LibraryFilters />
      <LibraryResultsGrid size={size} />
    </LibraryProvider>
  );
}
