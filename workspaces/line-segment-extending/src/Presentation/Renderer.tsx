import { SvgLabelsProvider } from '@hogg/common';
import { Appear, Box } from 'preshape';
import Atan2Annotations from './Layers/Atan2Annotations';
import Bounds from './Layers/Bounds';
import ExtendedLineSegment from './Layers/ExtendedLineSegment';
import OriginalLineSegment from './Layers/OriginalLineSegment';
import { useLineSegmentContext } from './useLineSegmentContext';

type Props = {};

export default function Renderer({}: Props) {
  const {
    containerWidth,
    containerHeight,
    refDimensionContainer,
    refSvgContainer,
  } = useLineSegmentContext();

  return (
    <SvgLabelsProvider width={containerWidth} height={containerHeight}>
      <Box container grow ref={refDimensionContainer}>
        {containerHeight !== 0 && containerWidth !== 0 && (
          <Appear animation="Fade" flex="horizontal" grow delay={400}>
            <Box
              tag="svg"
              viewBox={`0 0 ${containerWidth} ${containerHeight}`}
              ref={refSvgContainer}
              height={containerHeight}
              width={containerWidth}
              absolute="center"
              style={{
                shapeRendering: 'geometricPrecision',
              }}
            >
              <Bounds />
              <ExtendedLineSegment />
              <Atan2Annotations />
              <OriginalLineSegment />
            </Box>
          </Appear>
        )}
      </Box>
    </SvgLabelsProvider>
  );
}
