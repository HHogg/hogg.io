import { Box, Separator, Text, useThemeContext } from 'preshape';
import TransformDescription from '../Notation/TransformDescription';
import { useNotationContext } from '../Notation/useNotationContext';
import { formatMs, formatPercent } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import StageCard from './StageCard';
import StageCards from './StageCards';
import { colorTransform } from './constants';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function TransformDurationBreakdown() {
  const { transforms: notationTransforms } = useNotationContext();
  const { colors } = useThemeContext();
  const { transforms, totalDuration, stageDurationTransform } =
    useArrangementStatsContext();

  return (
    <Box>
      <StageCards>
        <StageCard padding="x6">
          <Box flex="horizontal" gap="x6">
            <Text
              align="start"
              margin="x4"
              size="x5"
              weight="x2"
              basis="0"
              grow="3"
            >
              Transforms
            </Text>

            <Text basis="0" grow="1" weight="x2">
              <Text align="end" margin="x2">
                {formatMs(stageDurationTransform)} |{' '}
                {formatPercent(stageDurationTransform / totalDuration)}
              </Text>
            </Text>
          </Box>

          <BreakdownBar
            sections={[
              {
                color: colorTransform,
                value: stageDurationTransform,
              },
              {
                color: colors.colorBackgroundShade4,
                value: totalDuration - stageDurationTransform,
              },
            ]}
          />

          <Separator borderColor="background-shade-4" margin="x4" />

          {transforms
            .sort((a, b) => b.totalDuration - a.totalDuration)
            .map(
              ({ totalDuration: transformTotalDuration }, transformIndex) => (
                <Text
                  borderBottom
                  borderColor="background-shade-4"
                  borderSize="x1"
                  flex="horizontal"
                  gap="x6"
                  key={notationTransforms[transformIndex]}
                  margin="x4"
                  paddingBottom="x4"
                  size="x3"
                >
                  <Text basis="0" grow="3">
                    <Text weight="x2" margin="x2">
                      {notationTransforms[transformIndex]}
                    </Text>

                    <Text size="x2">
                      <TransformDescription
                        transform={notationTransforms[transformIndex]}
                      />
                    </Text>
                  </Text>

                  <Text basis="0" grow="1" weight="x2">
                    <Text align="end" margin="x2">
                      {formatMs(transformTotalDuration)} |{' '}
                      {formatPercent(transformTotalDuration / totalDuration)}
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
                  </Text>
                </Text>
              )
            )}
        </StageCard>
      </StageCards>
    </Box>
  );
}
