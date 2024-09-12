import { Text, useThemeContext } from 'preshape';
import { useNotationContext } from '../Notation/useNotationContext';
import { formatMs, formatPercent } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import StageCard from './StageCard';
import StageCards from './StageCards';
import { colorTransform } from './constants';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function TransformDurationBreakdown() {
  const { colors } = useThemeContext();
  const { transforms: notationTransforms } = useNotationContext();
  const { transforms, totalDuration } = useArrangementStatsContext();

  return (
    <StageCards>
      {transforms.map(({ totalDuration: transformTotalDuration }, index) => (
        <StageCard key={notationTransforms[index]} padding="x6">
          <Text
            flex="horizontal"
            alignChildrenHorizontal="between"
            gap="x4"
            margin="x3"
            weight="x2"
            size="x3"
          >
            <Text>{notationTransforms[index]}</Text>
            <Text>
              {formatMs(transformTotalDuration)} |{' '}
              {formatPercent(transformTotalDuration / totalDuration)}
            </Text>
          </Text>

          <BreakdownBar
            sections={[
              {
                color: colorTransform,
                value: transformTotalDuration,
              },
              {
                color: colors.colorBackgroundShade4,
                value: totalDuration - transformTotalDuration,
              },
            ]}
          />
        </StageCard>
      ))}
    </StageCards>
  );
}
