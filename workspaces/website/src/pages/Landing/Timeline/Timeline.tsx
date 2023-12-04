import { Box, BoxProps, useMatchMedia } from 'preshape';
import data from '../../../data';
import TimelineDate from './TimelineDate';
import TimelineEntry from './TimelineEntry';

export default function Timeline(props: BoxProps) {
  const match = useMatchMedia(['600px']);
  const isSmall = !match('600px');

  return (
    <Box {...props} flex="vertical" gap="x16">
      {data.placements.map((placement, index, { length }) => (
        <Box
          alignChildrenHorizontal="start"
          key={placement.date}
          flex={isSmall ? 'vertical' : 'horizontal'}
          gap={isSmall ? 'x8' : 'x8'}
        >
          <TimelineEntry {...placement} />
          <TimelineDate
            date={placement.date}
            isLast={index === length - 1}
            paddingLeft="x8"
          />
        </Box>
      ))}
    </Box>
  );
}
