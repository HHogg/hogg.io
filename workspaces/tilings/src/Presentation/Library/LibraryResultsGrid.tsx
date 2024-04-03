import { useProjectWindowContext } from '@hogg/common';
import { Box, Grid, Motion, Text } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import TilingResult from '../Tiling/TilingResult';
import { formatUniform } from '../utils/formatting';
import { useLibraryContext } from './useLibraryContext';

export default function LibraryResultsGrid() {
  const { setNotation } = useNotationContext();
  const { filteredResultsByUniform } = useLibraryContext();
  const { hideTab } = useProjectWindowContext();

  const handleSelect = (notation: string) => {
    hideTab();
    setNotation(notation);
  };

  return (
    <Box>
      {Object.entries(filteredResultsByUniform).map(([uniform, notations]) => (
        <Motion
          layout
          key={uniform}
          id={`uniform-${uniform}`}
          paddingBottom="x8"
          borderBottom
          borderColor="background-shade-4"
          margin="x8"
        >
          <Text margin="x8" size="x3" weight="x2">
            {formatUniform(uniform)} ({notations.length})
          </Text>

          <Grid gap="x8" repeatWidthMin="140px">
            {notations.map(({ notation }) => (
              <Motion layout key={notation}>
                <TilingResult
                  borderRadius="x2"
                  height="100px"
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
