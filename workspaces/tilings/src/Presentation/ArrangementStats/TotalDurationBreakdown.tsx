import { Box, Text } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import { usePlayerContext } from '../Player/usePlayerContext';
import { formatMs } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import {
  colorPath,
  colorRender,
  colorTransform,
  colorValidation,
} from './constants';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function TotalDurationBreakdown() {
  const { path: notationPath, transforms: notationTransforms } =
    useNotationContext();
  const { renderResult } = usePlayerContext();
  const {
    totalDuration,
    transforms,
    stageDurationPlacement,
    stageDurationDraw,
    stageDurationRender,
    stageDurationValidation,
  } = useArrangementStatsContext();

  return (
    <Box>
      <Box alignChildren="middle" flex="horizontal" gap="x4" margin="x8">
        <Box>
          <Text align="middle" size="x5" weight="x2">
            {formatMs(totalDuration)}
          </Text>

          <Text align="middle" size="x2" weight="x2" textColor="text-shade-2">
            Total build time
          </Text>

          <Text align="middle" size="x2">
            ({renderResult?.repetitions} repetitions)
          </Text>
        </Box>
      </Box>

      <BreakdownBar
        maxWidth={600}
        sections={[
          {
            name: notationPath,
            color: colorPath,
            value: stageDurationPlacement,
          },
          ...transforms.map(({ totalDuration }, i) => ({
            name: notationTransforms[i],
            color: colorTransform,
            value: totalDuration,
          })),
          {
            name: 'validations',
            color: colorValidation,
            value: stageDurationValidation,
          },
          {
            name: 'render',
            color: colorRender,
            value: stageDurationDraw + stageDurationRender,
          },
        ]}
      />
    </Box>
  );
}
