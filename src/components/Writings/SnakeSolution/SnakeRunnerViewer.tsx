import { getAverage, getScore, SnakeContext, SnakeViewer } from '@hhogg/snake';
import { Appear, Buttons, Button, CodeBlock, Box, Icon, Link, List, ListItem, Text, useIntersectionObserver } from 'preshape';
import * as React from 'react';
import 'brace/mode/javascript';

interface Props {
  solution: string;
}

export default (props: Props) => {
  const { solution } = props;
  const { history, onPause, onPlay, onStart, onReset, xLength, yLength } = React.useContext(SnakeContext);
  const [isCodeVisible, setCodeVisible] = React.useState(false);
  const [isInView, ref] = useIntersectionObserver();

  React.useEffect(() => {
    if (!isInView) {
      onPause();
      onReset();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <Box flex="vertical" gap="x2" grow ref={ ref } theme="night">
      <Box container>
        <Appear
            absolute="edge-to-edge"
            animation="FadeSlideUp"
            scrollable
            style={ { pointerEvents: isCodeVisible ? undefined : 'none' } }
            visible={ isCodeVisible }>
          <CodeBlock language="javascript">
            { solution }
          </CodeBlock>
        </Appear>

        <Appear
            animation="FadeSlideDown"
            style={ { pointerEvents: isCodeVisible ? 'none' : undefined } }
            visible={ !isCodeVisible }>
          <Box
              flex="vertical"
              gap="x3"
              grow
              padding="x3">
            <Box
                container
                flex="vertical"
                height="450px">
              <SnakeViewer theme="night" />
            </Box>

            <Box>
              <List alignChildrenHorizontal="middle">
                <ListItem separator="~">
                  <Text inline strong>Points:</Text> { history.length - 1 }
                </ListItem>

                <ListItem separator="~">
                  <Text inline strong>Average:</Text> { Math.floor(getAverage(history.slice(0, -1))) }
                </ListItem>

                <ListItem separator="~">
                  <Text inline strong>Score:</Text> { Math.floor(getScore(xLength, yLength, history.slice(0, -1))) }
                </ListItem>
              </List>
            </Box>

            <Box alignChildrenHorizontal="middle" flex="horizontal">
              <Buttons>
                <Button onClick={ () => {
                  onStart();
                  onPlay();
                } }>
                  <Icon name="Play" size="1rem" />
                </Button>

                <Button onClick={ () => onPause() }>
                  <Icon name="Pause" size="1rem" />
                </Button>

                <Button onClick={ () => onReset() }>
                  <Icon name="Refresh" size="1rem" />
                </Button>
              </Buttons>
            </Box>
          </Box>
        </Appear>
      </Box>

      <Box alignChildren="middle" flex="horizontal">
        <Link
            onClick={ () => setCodeVisible(!isCodeVisible) }
            strong
            underline>
          { isCodeVisible ? 'Back to Runner' : 'See solution code' }
        </Link>
      </Box>
    </Box>
  );
};
