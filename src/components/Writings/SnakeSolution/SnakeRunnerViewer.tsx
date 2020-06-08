import * as React from 'react';
import { Appear, Buttons, Button, CodeBlock, Flex, Icon, Link, List, ListItem, Text } from 'preshape';
import { getAverage, getScore, SnakeContext, SnakeViewer } from '@hhogg/snake';
import 'brace/mode/javascript';

interface Props {
  solution: string;
}

export default (props: Props) => {
  const { solution } = props;
  const { history, onPause, onPlay, onStart, onReset, xLength, yLength } = React.useContext(SnakeContext);
  const [isCodeVisible, setCodeVisible] = React.useState(false);

  return (
    <Flex direction="vertical" gap="x2" grow theme="night">
      <Flex container>
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
          <Flex
              direction="vertical"
              gap="x3"
              grow
              padding="x3">
            <Flex
                container
                direction="vertical"
                height="450px">
              <SnakeViewer theme="night" />
            </Flex>

            <Flex>
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
            </Flex>

            <Flex alignChildrenHorizontal="middle" direction="horizontal">
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
            </Flex>
          </Flex>
        </Appear>
      </Flex>

      <Flex alignChildren="middle" direction="horizontal">
        <Link
            onClick={ () => setCodeVisible(!isCodeVisible) }
            strong
            underline>
          { isCodeVisible ? 'Back to Runner' : 'See solution code' }
        </Link>
      </Flex>
    </Flex>
  );
};
