import { meta as circularSequenceProject } from '@hogg/circular-sequence';
import { ProjectPageLink } from '@hogg/common';
import { meta as spatialGridMapProject } from '@hogg/spatial-grid-map';
import { meta as gapValidationProject } from '@hogg/tilings-validation-gaps';
import { FeatureToggle } from '@hogg/wasm';
import { Box, Separator, Text, useThemeContext } from 'preshape';
import { formatMs, formatPercent } from '../utils/formatting';
import BreakdownBar from './BreakdownBar/BreakdownBar';
import StageCard from './StageCard';
import StageCards from './StageCards';
import { colorValidation } from './constants';
import { Validation } from './useArrangementStats';
import { useArrangementStatsContext } from './useArrangementStatsContext';

export default function ValidationDurationBreakdown() {
  const { colors } = useThemeContext();
  const { validations, totalDuration, stageDurationValidation } =
    useArrangementStatsContext();

  const validationNames: Record<Validation, string> = {
    [FeatureToggle.ValidateGaps]: 'Gaps between shapes',
    [FeatureToggle.ValidateOverlaps]: 'Shape overlaps',
    [FeatureToggle.ValidateVertexTypes]: 'Only contains valid vertex types',
  };

  const validationDescriptions: Record<Validation, JSX.Element> = {
    [FeatureToggle.ValidateGaps]: (
      <>
        A checks for gaps between other shapes, using{' '}
        <ProjectPageLink
          project={gapValidationProject}
          target={gapValidationProject.id}
        />
        .'
      </>
    ),
    [FeatureToggle.ValidateOverlaps]: (
      <>
        A check for overlapping shapes, by performing line intersections
        efficiently using{' '}
        <ProjectPageLink
          project={spatialGridMapProject}
          target={spatialGridMapProject.id}
        />
        .
      </>
    ),
    [FeatureToggle.ValidateVertexTypes]: (
      <>
        A check that the vertex types are part of the known set, using{' '}
        <ProjectPageLink
          project={circularSequenceProject}
          target={circularSequenceProject.id}
        />
        .
      </>
    ),
  };

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
              Validations
            </Text>

            <Text basis="0" grow="1" weight="x2">
              <Text align="end" margin="x2">
                {formatMs(stageDurationValidation)} |{' '}
                {formatPercent(stageDurationValidation / totalDuration)}
              </Text>
            </Text>
          </Box>

          <BreakdownBar
            sections={[
              {
                color: colorValidation,
                value: stageDurationValidation,
              },
              {
                color: colors.colorBackgroundShade4,
                value: totalDuration - stageDurationValidation,
              },
            ]}
          />

          <Separator borderColor="background-shade-4" margin="x4" />

          {Object.entries(validations)
            .sort(([, a], [, b]) => b.totalDuration - a.totalDuration)
            .map(([flag, { totalDuration: validationTotalDuration }]) => (
              <Text
                borderBottom
                borderColor="background-shade-4"
                borderSize="x1"
                flex="horizontal"
                gap="x6"
                key={flag}
                margin="x4"
                paddingBottom="x4"
                size="x3"
              >
                <Text basis="0" grow="3">
                  <Text weight="x2" margin="x2">
                    {validationNames[flag as Validation]}
                  </Text>

                  <Text size="x2">
                    {validationDescriptions[flag as Validation]}
                  </Text>
                </Text>

                <Text basis="0" grow="1" weight="x2">
                  <Text align="end" margin="x2">
                    {formatMs(validationTotalDuration)} |{' '}
                    {formatPercent(validationTotalDuration / totalDuration)}
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
                </Text>
              </Text>
            ))}
        </StageCard>
      </StageCards>
    </Box>
  );
}
