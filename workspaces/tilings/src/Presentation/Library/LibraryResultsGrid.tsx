import { Box, Grid, Motion, Text } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import TilingResult from '../Tiling/TilingResult';
import { useLibraryContext } from './useLibraryContext';

export type LibraryResultsGridProps = {
  size: string;
};

export default function LibraryResultsGrid({ size }: LibraryResultsGridProps) {
  const { setNotation } = useNotationContext();
  const { filteredResultsByGroup } = useLibraryContext();

  const handleSelect = (notation: string) => {
    setNotation(notation);
  };

  return (
    <Box>
      {Object.entries(filteredResultsByGroup).map(([group, notations]) => (
        <Motion
          layout
          key={group}
          id={`group-${group}`}
          paddingBottom="x8"
          borderBottom
          borderColor="background-shade-4"
          margin="x8"
        >
          <Text margin="x8" size="x3" weight="x2">
            {group} ({notations.length})
          </Text>

          <Grid gap="x8" repeatWidthMin={size} repeatWidthMax={size}>
            {notations.map(({ notation }) => (
              <Motion layout key={notation}>
                <TilingResult
                  borderRadius="x2"
                  height={size}
                  notation={notation}
                  onClick={() => handleSelect(notation)}
                  scale={1.5}
                  withGomJauHogg
                />
              </Motion>
            ))}
          </Grid>
        </Motion>
      ))}
    </Box>
  );
}
