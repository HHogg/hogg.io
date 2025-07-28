import { Box, BoxProps } from 'preshape';
import data from '../../../data';
import TimelineEntry from './TimelineEntry';

export default function Timeline(props: BoxProps) {
  return (
    <Box {...props} flex="vertical" gap="x16">
      {data.placements.map((placement) => (
        <Box
          alignChildrenHorizontal="middle"
          key={placement.date}
          flex="horizontal"
          gap="x8"
          wrap
        >
          <TimelineEntry {...placement} />
        </Box>
      ))}
    </Box>
  );
}
