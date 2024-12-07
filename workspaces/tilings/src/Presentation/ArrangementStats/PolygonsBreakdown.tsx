import { Box, colorNegativeShade4, Text, useThemeContext } from 'preshape';
import { formatNumber, formatPercent } from '../utils/formatting';
import SeriesChart from './SeriesChart/SeriesChart';
import SeriesChartLine from './SeriesChart/SeriesChartLine';
import StageCard from './StageCard';
import StageCards from './StageCards';
import useArrangementStats from './useArrangementStats';

export default function PolygonsBreakdown() {
  const {
    polygonsAdded,
    polygonsAddedSeries,
    polygonsSkipped,
    polygonsSkippedSeries,
  } = useArrangementStats();

  const { colors } = useThemeContext();
  const totalPolygonsCreated = polygonsAdded + polygonsSkipped;

  return (
    <StageCards>
      <StageCard>
        <Box flex="horizontal" gap="x4">
          <Box>
            <Text align="start" padding="x6">
              <Text size="x3" weight="x2" margin="x2">
                Polygons added |
                {formatPercent(polygonsAdded / totalPolygonsCreated)}
              </Text>

              <Text textColor="accent-shade-4" size="x6">
                {formatNumber(polygonsAdded)}
              </Text>
            </Text>
          </Box>

          <Box
            basis="0"
            grow
            paddingTop="x6"
            paddingBottom="x6"
            flex="vertical"
          >
            <SeriesChart>
              <SeriesChartLine
                color={colors.colorAccentShade4}
                id="polygons-added"
                series={polygonsAddedSeries}
                withGradientArea
              />

              <SeriesChartLine
                color={colorNegativeShade4}
                id="polygons-skipped"
                series={polygonsSkippedSeries}
                withGradientArea
              />
            </SeriesChart>
          </Box>

          <Box>
            <Text align="end" padding="x6">
              <Text size="x3" weight="x2">
                {formatPercent(polygonsSkipped / totalPolygonsCreated)} |
                Polygons skipped
              </Text>

              <Text textColor="negative-shade-4" size="x6" margin="x2">
                {formatNumber(polygonsSkipped)}
              </Text>
            </Text>
          </Box>
        </Box>

        <Text
          align="middle"
          textColor="text-shade-3"
          size="x1"
          paddingHorizontal="x6"
          paddingBottom="x3"
        >
          Skipped polygons: Polygons that have been created by a transform but
          already exist in the arrangement.
        </Text>
      </StageCard>
    </StageCards>
  );
}
