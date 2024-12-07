import { Box, Separator, Text, useThemeContext } from 'preshape';
import { formatMs, formatPercent } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import StageCard from './StageCard';
import StageCards from './StageCards';
import { colorRender } from './constants';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function RenderDurationBreakdown() {
  const { colors } = useThemeContext();
  const { totalDuration, stageDurationDraw, stageDurationRender } =
    useArrangementStatsContext();
  const stageDurationRenderTotal = stageDurationDraw + stageDurationRender;

  const renders = [
    {
      label: 'Render',
      description:
        "Building the layers by iterating over the components of the tiling, it's at this stage sizes can be determined for scaling",
      totalDuration: stageDurationRender,
    },
    {
      label: 'Draw',
      description:
        'Drawing the layers to the canvas, this is the final stage of the rendering process',
      totalDuration: stageDurationDraw,
    },
  ];

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
              Render
            </Text>

            <Text basis="0" grow="1" weight="x2">
              <Text align="end" margin="x2">
                {formatMs(stageDurationRenderTotal)} |{' '}
                {formatPercent(stageDurationRenderTotal / totalDuration)}
              </Text>
            </Text>
          </Box>

          <BreakdownBar
            sections={[
              {
                color: colorRender,
                value: stageDurationRenderTotal,
              },
              {
                color: colors.colorBackgroundShade4,
                value: totalDuration - stageDurationRenderTotal,
              },
            ]}
          />

          <Separator borderColor="background-shade-4" margin="x4" />

          {renders
            .sort((a, b) => b.totalDuration - a.totalDuration)
            .map(({ label, description, totalDuration: renderDuration }) => (
              <Text
                borderBottom
                borderColor="background-shade-4"
                borderSize="x1"
                flex="horizontal"
                gap="x6"
                key={label}
                margin="x4"
                paddingBottom="x4"
                size="x3"
              >
                <Text basis="0" grow="3">
                  <Text weight="x2" margin="x2">
                    {label}
                  </Text>

                  <Text size="x2">{description}</Text>
                </Text>

                <Text basis="0" grow="1" weight="x2">
                  <Text align="end" margin="x2">
                    {formatMs(renderDuration)} |{' '}
                    {formatPercent(renderDuration / totalDuration)}
                  </Text>

                  <BreakdownBar
                    sections={[
                      {
                        color: colorRender,
                        value: renderDuration,
                      },
                      {
                        color: colors.colorBackgroundShade4,
                        value: totalDuration - renderDuration,
                      },
                    ]}
                  />
                </Text>
              </Text>
            ))}
        </StageCard>
      </StageCards>
    </Box>
  );
}
