import { Box } from 'preshape';
import ArrangementStatsProvider from './ArrangementStatsProvider';
import PolygonsBreakdown from './PolygonsBreakdown';
import TotalDurationBreakdown from './TotalDurationBreakdown';

export default function ArrangementStats() {
  return (
    <ArrangementStatsProvider>
      <Box flex="vertical" gap="x10">
        <TotalDurationBreakdown />
        <PolygonsBreakdown />
      </Box>
    </ArrangementStatsProvider>
  );
}
