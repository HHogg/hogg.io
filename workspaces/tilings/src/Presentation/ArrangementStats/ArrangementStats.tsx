import { Box } from 'preshape';
import ArrangementStatsProvider from './ArrangementStatsProvider';
import PolygonsBreakdown from './PolygonsBreakdown';
import RenderDurationBreakdown from './RenderDurationBreakdown';
import TotalDurationBreakdown from './TotalDurationBreakdown';
import TransformDurationBreakdown from './TransformDurationBreakdown';
import ValidationDurationBreakdown from './ValidationDurationBreakdown';

export default function ArrangementStats() {
  return (
    <ArrangementStatsProvider>
      <Box flex="vertical" gap="x10">
        <TotalDurationBreakdown />
        <PolygonsBreakdown />
        <TransformDurationBreakdown />
        <ValidationDurationBreakdown />
        <RenderDurationBreakdown />
      </Box>
    </ArrangementStatsProvider>
  );
}
