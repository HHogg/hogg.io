import { Appear, Box, Link, Text } from 'preshape';
import * as React from 'react';
import { useSnakeContext } from './useSnakeContext';

export default function SnakeConsole() {
  const { logs, onClearLog } = useSnakeContext();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    window.requestAnimationFrame(() => {
      ref.current?.lastElementChild?.scrollIntoView();
    });
  }, [logs]);

  return (
    <Box basis="0" container flex="vertical" grow height="7rem">
      <Box flex="vertical" grow height="5rem">
        <Box
          backgroundColor="background-shade-2"
          basis="0"
          grow
          padding="x3"
          ref={ref}
          overflow="auto"
        >
          {logs.map((message, index) => (
            <Text key={index} monospace>{`> ${message}`}</Text>
          ))}
        </Box>

        <Appear animation="FadeSlideUp" visible={logs.length > 0}>
          <Box absolute="bottom-right" padding="x2">
            <Link onClick={onClearLog} size="x1" weight="x2">
              Clear Console
            </Link>
          </Box>
        </Appear>
      </Box>
    </Box>
  );
}
