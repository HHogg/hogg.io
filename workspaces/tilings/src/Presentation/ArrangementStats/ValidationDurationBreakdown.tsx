import { Text, useThemeContext } from 'preshape';
import { formatMs, formatPercent } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import StageCard from './StageCard';
import StageCards from './StageCards';
import { colorValidation } from './constants';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function ValidationDurationBreakdown() {
  const { colors } = useThemeContext();
  const { validations, totalDuration } = useArrangementStatsContext();

  return (
    <StageCards>
      {Object.entries(validations).map(
        ([flag, { totalDuration: validationTotalDuration }]) => (
          <StageCard key={flag} padding="x6">
            <Text
              flex="horizontal"
              alignChildrenHorizontal="between"
              gap="x4"
              margin="x3"
              weight="x2"
              size="x3"
            >
              <Text>{flag}</Text>
              <Text>
                {formatMs(validationTotalDuration)} |{' '}
                {formatPercent(validationTotalDuration / totalDuration)}
              </Text>
            </Text>

            <BreakdownBar
              sections={[
                {
                  color: colorValidation,
                  value: validationTotalDuration,
                },
                {
                  color: colors.colorBackgroundShade4,
                  value: totalDuration - validationTotalDuration,
                },
              ]}
            />
          </StageCard>
        )
      )}
    </StageCards>
  );
}
