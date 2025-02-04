import { Lines } from '@hogg/common';
import { ArrowUp } from 'lucide-react';
import { DateTime } from 'luxon';
import { Box, BoxProps, Text } from 'preshape';

const formatDate = (date: string) =>
  DateTime.fromISO(date).toFormat('MMM yyyy');

type Props = BoxProps & {
  dateFrom: string;
  dateTo?: string;
  isLast: boolean;
};

export default function TimelineDate({
  dateFrom,
  dateTo,
  isLast,
  ...rest
}: Props) {
  return (
    <Box {...rest} alignChildrenHorizontal="end" flex="vertical" gap="x4">
      <Text container monospace weight="x3" size="x5" paddingTop="x4">
        {dateTo ? formatDate(dateTo) : 'Today'}
      </Text>

      <Box alignChildrenHorizontal="middle" flex="vertical" gap="x4" grow>
        <Box flex="horizontal" grow minHeight="50px">
          <Lines
            backgroundColor="background-shade-4"
            count={3}
            flex="horizontal"
            size={(i) => i + 1}
            gap="x1"
          />
        </Box>

        <Box alignSelf="start" textColor="background-shade-4">
          <ArrowUp size="2rem" />
        </Box>
      </Box>

      {isLast && (
        <Text container monospace weight="x3" size="x5" paddingTop="x4">
          {formatDate(dateFrom)}
        </Text>
      )}
    </Box>
  );
}
