import { Box, Text } from 'preshape';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from '../Notation/useNotationContext';
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
  const { tiling } = useArrangementContext();
  const {
    totalDuration,
    transforms,
    validations,
    stageDurationPlacement,
    stageDurationDraw,
    stageDurationRender,
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
            ({tiling?.plane.expansionPhases} repetitions)
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
          ...Object.entries(validations).map(([flag, { totalDuration }]) => ({
            name: flag.toLocaleLowerCase(),
            color: colorValidation,
            value: totalDuration,
          })),
          {
            name: 'draw',
            color: colorRender,
            value: stageDurationDraw,
          },
          {
            name: 'render',
            color: colorRender,
            value: stageDurationRender,
          },
        ]}
      />
    </Box>
  );
}
