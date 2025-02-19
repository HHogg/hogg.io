import { Box, Grid, Motion, Text } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import TilingResult from '../Tiling/TilingResult';
import { formatShape } from '../utils/formatting';
import { useLibraryContext } from './useLibraryContext';

export default function LibraryResultsGrid() {
  const { setNotation } = useNotationContext();
  const { filteredResultsBySeed } = useLibraryContext();

  const handleSelect = (notation: string) => {
    setNotation(notation);
  };

  return (
    <Box>
      {Object.entries(filteredResultsBySeed).map(([seed, notations]) => (
        <Motion
          layout
          key={seed}
          id={`seed-${seed}`}
          paddingBottom="x8"
          borderBottom
          borderColor="background-shade-4"
          margin="x8"
        >
          <Text margin="x8" size="x3" weight="x2">
            {formatShape(seed)} ({notations.length})
          </Text>

          <Grid gap="x8" repeatWidthMin="180px">
            {notations.map(({ notation }) => (
              <Motion layout key={notation}>
                <TilingResult
                  borderRadius="x2"
                  height="140px"
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
