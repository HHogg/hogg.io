import { Box, BoxProps, Text, useResizeObserver } from 'preshape';
import useWasmApi, { Sequence } from '../WasmApi/useWasmApi';

type Props = BoxProps & {
  sequence: Sequence;
};

export default function RendererSequence({ sequence, ...rest }: Props) {
  const [{ width }, ref] = useResizeObserver();
  const { length: getLength } = useWasmApi();

  const length = getLength(sequence);
  const center = width * 0.5;

  const points = sequence
    .filter((value) => Boolean(value))
    .map((_, index, { length }) => {
      const angle = (index / length) * Math.PI * 2;
      const x = center + Math.cos(angle) * center;
      const y = center + Math.sin(angle) * center;

      return [x, y];
    });

  return (
    <Box
      {...rest}
      container
      height={width}
      overflow="hidden"
      ref={ref}
      textColor="text-shade-1"
    >
      <Box
        absolute="center"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        tag="svg"
        viewBox={`0 0 ${width} ${width}`}
      >
        {/* <polygon
          points={points.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        /> */}

        <circle
          cx={center}
          cy={center}
          r={center}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        />

        <g>
          {points.map(([x, y], index) => (
            <g key={index} transform={`translate(${x},${y})`}>
              <Text
                alignmentBaseline="middle"
                fill="currentColor"
                tag="text"
                textAnchor="middle"
                size="x6"
              >
                {sequence[index]}
              </Text>
            </g>
          ))}
        </g>

        <g transform={`translate(${center},${center})`}>
          <Text
            alignmentBaseline="middle"
            fill="currentColor"
            tag="text"
            textAnchor="middle"
            size="x8"
          >
            {length}
          </Text>
        </g>
      </Box>
    </Box>
  );
}
