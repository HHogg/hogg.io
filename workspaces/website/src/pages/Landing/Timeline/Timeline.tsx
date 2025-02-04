import { Box, BoxProps } from 'preshape';
import data from '../../../data';
import TimelineDate from './TimelineDate';
import TimelineEntry from './TimelineEntry';

export default function Timeline(props: BoxProps) {
  return (
    <Box {...props} flex="vertical" gap="x16">
      {data.placements.map((placement, index, { length }) => (
        <Box
          alignChildrenHorizontal="middle"
          key={placement.date}
          flex="horizontal"
          gap="x8"
          wrap
        >
          <TimelineEntry {...placement} />
          <TimelineDate
            dateFrom={placement.date}
            dateTo={index ? data.placements[index - 1].date : undefined}
            isLast={index === length - 1}
          />
        </Box>
      ))}
    </Box>
  );
}
