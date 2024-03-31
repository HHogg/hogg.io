import { Lines } from '@hogg/common';
import { ArrowDown } from 'lucide-react';
import { DateTime } from 'luxon';
import { Box, BoxProps, Text } from 'preshape';

const formatDate = (date: string) =>
  DateTime.fromISO(date).toFormat('MMM yyyy');

type Props = BoxProps & {
  date: string;
  isLast: boolean;
};

export default function TimelineDate({ date, isLast, ...rest }: Props) {
  return (
    <Box {...rest} alignChildrenHorizontal="middle" flex="vertical" gap="x4">
      <Text container monospace weight="x3" size="x5" paddingTop="x4">
        {formatDate(date)}
      </Text>

      {!isLast && (
        <Box alignChildrenHorizontal="middle" flex="vertical" gap="x4" grow>
          <Box flex="horizontal" grow minHeight="100px">
            <Lines
              backgroundColor="background-shade-4"
              count={3}
              flex="horizontal"
              size={(i) => i + 1}
              gap="x1"
            />
          </Box>

          <Box alignSelf="start" textColor="text-shade-1">
            <ArrowDown size="2rem" />
          </Box>
        </Box>
      )}
    </Box>
  );
}
