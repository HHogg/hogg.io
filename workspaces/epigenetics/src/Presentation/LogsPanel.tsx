import { CheckIcon, XIcon } from 'lucide-react';
import { Box, Grid, Label, Text } from 'preshape';
import { Fragment, useLayoutEffect, useRef } from 'react';
import { UseSimulationWorkerResult } from '../worker/useSimulationWorker';

export default function LogsPanel({
  messageHandler,
}: {
  messageHandler: UseSimulationWorkerResult;
}) {
  const { events } = messageHandler;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when events change
  useLayoutEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    }, 0);
  }, [events]);

  return (
    <Text monospace size="x2">
      <Grid
        gapHorizontal="x4"
        gapVertical="x1"
        style={{
          alignItems: 'center',
          gridTemplateColumns: 'max-content 1fr',
        }}
      >
        {events.map((event, index) => (
          <Fragment key={index}>
            <Text>{index}</Text>
            <Text>
              {event.type === 'success' && (
                <Label
                  alignChildrenVertical="middle"
                  backgroundColor="positive-shade-5"
                  textColor="white"
                  gap="x1"
                  flex="horizontal"
                  paddingLeft="x1"
                  paddingRight="x2"
                  paddingVertical="x0"
                  uppercase
                  weight="x2"
                >
                  <CheckIcon size="12" />
                  <Text>{event.message}</Text>
                </Label>
              )}

              {event.type === 'error' && (
                <Label
                  alignChildrenVertical="middle"
                  backgroundColor="negative-shade-5"
                  textColor="white"
                  gap="x1"
                  flex="horizontal"
                  paddingLeft="x1"
                  paddingRight="x2"
                  paddingVertical="x0"
                  uppercase
                  weight="x2"
                >
                  <XIcon size="12" />
                  <Text>{event.message}</Text>
                </Label>
              )}

              {event.type === 'info' && (
                <Text>
                  <Box tag="pre">{event.message}</Box>
                </Text>
              )}
            </Text>
          </Fragment>
        ))}
      </Grid>
    </Text>
  );
}
