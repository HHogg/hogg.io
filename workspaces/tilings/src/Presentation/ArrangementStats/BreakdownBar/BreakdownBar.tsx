import { Point, SvgLabelsProvider } from '@hogg/common';
import { Box, BoxProps, useResizeObserver } from 'preshape';
import BreakdownBarSection from './BreakdownBarSection';
import { barHeight } from './utils';

const heightWithLabels = 50;
const gap = barHeight * 0.5;

// Even points will move to the left from half way to 0
// Odd points will move to the right from half way to width
const toEitherSide = (count: number, width: number) => {
  const points: Point[] = [];
  const steps = width / count;

  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      points.push([steps * Math.floor(i * 0.5), 0]);
    } else {
      points.push([steps * Math.floor(i * 0.5) * -1, 0]);
    }
  }

  return points;
};

type BreakdownBarProps = BoxProps & {
  sections: {
    name?: string;
    color: string;
    value: number;
  }[];
};

export default function BreakdownBar({ sections, ...rest }: BreakdownBarProps) {
  const [size, ref] = useResizeObserver();
  const { width } = size;

  const total = sections.reduce((acc, { value }) => acc + value, 0);
  const widths = sections.map(({ value }) =>
    Math.max(barHeight, total ? (value / total) * width : 0)
  );
  const lefts = sections.map((_, i) =>
    widths.slice(0, i).reduce((acc, width) => acc + width + gap, 0)
  );

  const totalWidth =
    (lefts[lefts.length - 1] ?? 0) + (widths[widths.length - 1] ?? 0);
  const offsetScaleX = width / totalWidth;

  const height = sections.some(({ name }) => name)
    ? heightWithLabels
    : barHeight;

  return (
    <Box {...rest} ref={ref}>
      <SvgLabelsProvider width={width} height={height} getPoints={toEitherSide}>
        <Box
          tag="svg"
          height={height}
          width={width}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            shapeRendering: 'geometricPrecision',
          }}
        >
          {sections.map((section, index) => (
            <BreakdownBarSection
              color={section.color}
              first={index === 0}
              key={index}
              last={index === sections.length - 1}
              name={section.name}
              left={lefts[index] * offsetScaleX}
              width={widths[index] * offsetScaleX}
              value={section.value}
            />
          ))}
        </Box>
      </SvgLabelsProvider>
    </Box>
  );
}
