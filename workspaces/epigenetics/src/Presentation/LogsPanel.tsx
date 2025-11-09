import { CheckIcon, XIcon } from 'lucide-react';
import { Box, Grid, Label, Text } from 'preshape';
import { Fragment } from 'react';
import { UseMessageHandlerResult } from '../worker/useMessageHandler';

export default function LogsPanel({
  messageHandler,
}: {
  messageHandler: UseMessageHandlerResult;
}) {
  const { events } = messageHandler;

  return (
    <Box overflow="scroll" maxHeight="500px">
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

                {event.type === 'info' && <Text>{event.message}</Text>}
              </Text>
            </Fragment>
          ))}
        </Grid>
      </Text>
    </Box>
  );
}
