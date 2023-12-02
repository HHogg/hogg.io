import { PauseIcon, PlayIcon, RefreshCwIcon } from 'lucide-react';
import {
  Appear,
  Buttons,
  Button,
  CodeBlock,
  Box,
  Link,
  List,
  ListItem,
  Text,
  useIntersectionObserver,
} from 'preshape';
import { useEffect, useState } from 'react';
import SnakeViewer from '../../Projects/Snake/SnakeViewer';
import { useSnakeContext } from '../../Projects/Snake/useSnakeContext';
import getAverage from '../../Projects/Snake/utils/getAverage';
import getScore from '../../Projects/Snake/utils/getScore';

interface Props {
  solution: string;
}

const SnakeRunnerViewer = (props: Props) => {
  const { solution } = props;
  const { history, onPause, onPlay, onStart, onReset, xLength, yLength } =
    useSnakeContext();
  const [isCodeVisible, setCodeVisible] = useState(false);
  const [isInView, ref] = useIntersectionObserver();

  // useEffect(() => {
  //   if (!isInView) {
  //     onPause();
  //     onReset();
  //   }
  // }, [isInView, onPause, onReset]);

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
          <CodeBlock language="typescript">{solution}</CodeBlock>
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
                  <Text tag="span" weight="x2">
                    Points:
                  </Text>{' '}
                  {history.length - 1}
                </ListItem>

                <ListItem separator="~">
                  <Text tag="span" weight="x2">
                    Average:
                  </Text>{' '}
                  {Math.floor(getAverage(history.slice(0, -1)))}
                </ListItem>

                <ListItem separator="~">
                  <Text tag="span" weight="x2">
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
                  <PlayIcon size="1rem" />
                </Button>

                <Button onClick={() => onPause()}>
                  <PauseIcon size="1rem" />
                </Button>

                <Button onClick={() => onReset()}>
                  <RefreshCwIcon size="1rem" />
                </Button>
              </Buttons>
            </Box>
          </Box>
        </Appear>
      </Box>

      <Box alignChildren="middle" flex="horizontal">
        <Link
          onClick={() => setCodeVisible(!isCodeVisible)}
          weight="x2"
          underline
        >
          {isCodeVisible ? 'Back to Runner' : 'See solution code'}
        </Link>
      </Box>
    </Box>
  );
};

export default SnakeRunnerViewer;
