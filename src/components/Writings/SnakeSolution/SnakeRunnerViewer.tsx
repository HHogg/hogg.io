import { getAverage, getScore, SnakeContext, SnakeViewer } from '@hhogg/snake';
import {
  Appear,
  Buttons,
  Button,
  CodeBlock,
  Box,
  Icons,
  Link,
  List,
  ListItem,
  Text,
  useIntersectionObserver,
} from 'preshape';
import React, { useContext, useEffect, useState } from 'react';
import 'brace/mode/javascript';

interface Props {
  solution: string;
}

const SnakeRunnerViewer = (props: Props) => {
  const { solution } = props;
  const { history, onPause, onPlay, onStart, onReset, xLength, yLength } =
    useContext(SnakeContext);
  const [isCodeVisible, setCodeVisible] = useState(false);
  const [isInView, ref] = useIntersectionObserver();

  useEffect(() => {
    if (!isInView) {
      onPause();
      onReset();
    }
  }, [isInView]);

  return (
    <Box flex="vertical" gap="x2" grow ref={ref} theme="night">
      <Box container>
        <Appear
          absolute="edge-to-edge"
          animation="FadeSlideUp"
          overflow="auto"
          style={{ pointerEvents: isCodeVisible ? undefined : 'none' }}
          visible={isCodeVisible}
        >
          <CodeBlock language="javascript">{solution}</CodeBlock>
        </Appear>

        <Appear
          animation="FadeSlideDown"
          style={{ pointerEvents: isCodeVisible ? 'none' : undefined }}
          visible={!isCodeVisible}
        >
          <Box flex="vertical" gap="x3" grow padding="x3">
            <Box container flex="vertical" height="450px">
              <SnakeViewer theme="night" />
            </Box>

            <Box>
              <List alignChildrenHorizontal="middle">
                <ListItem separator="~">
                  <Text inline strong>
                    Points:
                  </Text>{' '}
                  {history.length - 1}
                </ListItem>

                <ListItem separator="~">
                  <Text inline strong>
                    Average:
                  </Text>{' '}
                  {Math.floor(getAverage(history.slice(0, -1)))}
                </ListItem>

                <ListItem separator="~">
                  <Text inline strong>
                    Score:
                  </Text>{' '}
                  {Math.floor(getScore(xLength, yLength, history.slice(0, -1)))}
                </ListItem>
              </List>
            </Box>

            <Box alignChildrenHorizontal="middle" flex="horizontal">
              <Buttons>
                <Button
                  onClick={() => {
                    onStart();
                    onPlay();
                  }}
                >
                  <Icons.Play size="1rem" />
                </Button>

                <Button onClick={() => onPause()}>
                  <Icons.Pause size="1rem" />
                </Button>

                <Button onClick={() => onReset()}>
                  <Icons.RefreshCw size="1rem" />
                </Button>
              </Buttons>
            </Box>
          </Box>
        </Appear>
      </Box>

      <Box alignChildren="middle" flex="horizontal">
        <Link onClick={() => setCodeVisible(!isCodeVisible)} strong isTextLink>
          {isCodeVisible ? 'Back to Runner' : 'See solution code'}
        </Link>
      </Box>
    </Box>
  );
};

export default SnakeRunnerViewer;
