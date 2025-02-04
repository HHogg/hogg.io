import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Box, Button, CodeBlock, CodeBlockProps, Motion, Text } from 'preshape';
import { useRef, useState, useEffect } from 'react';
import ArticleFig, { ArticleFigProps } from './ArticleFig';

type Props = ArticleFigProps & {
  children: string;
  language: CodeBlockProps['language'];
  presentation?: JSX.Element;
  startLineNumber?: number;
  endLineNumber?: number;
};

function hasOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

export default function ArticleFigCodeBlock({
  children,
  language,
  presentation,
  startLineNumber,
  endLineNumber,
  // maxHeight,
  ...rest
}: Props) {
  const refCodeBlock = useRef<HTMLElement | null>(null);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (refCodeBlock.current && hasOverflown(refCodeBlock.current)) {
      setShowExpandButton(true);
    }
  }, []);

  const lines = children
    .split('\n')
    .slice((startLineNumber ?? 1) - 1, endLineNumber);
  const leadingSpaces = lines[0].match(/^\s*/)?.[0].length ?? 0;

  const contents = lines.map((line) => line.slice(leadingSpaces)).join('\n');

  return (
    <ArticleFig {...rest} flex="horizontal" padding="x0">
      {presentation && (
        <Box
          basis="0"
          borderRight
          borderColor="background-shade-4"
          borderSize="x1"
          flex="vertical"
          grow
          padding="x6"
          minWidth="0px"
        >
          {presentation}
        </Box>
      )}

      <Box
        basis="0"
        container
        flex="horizontal"
        grow
        minWidth="0px"
        overflow="hidden"
      >
        <Text basis="0" flex="horizontal" grow minWidth={0} size="x3">
          <Motion
            basis="0"
            flex="vertical"
            grow
            overflow="auto"
            ref={refCodeBlock}
          >
            <CodeBlock grow language={language} padding="x6">
              {contents}
            </CodeBlock>
          </Motion>
        </Text>

        {showExpandButton && (
          <Box absolute="bottom" padding="x3">
            <Button
              backgroundColor="transparent"
              backgroundColorHover="accent-shade-2"
              backgroundColorActive="accent-shade-1"
              borderSize="x1"
              borderColor="background-shade-4"
              borderColorHover="accent-shade-1"
              borderColorActive="accent-shade-1"
              flex="vertical"
              textColor="text-shade-1"
              textColorHover="text-shade-1"
              textColorActive="text-shade-1"
              onClick={() => setIsExpanded((isExpanded) => !isExpanded)}
              padding="x2"
              style={{
                backdropFilter: 'blur(2px)',
              }}
            >
              {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </Box>
        )}
      </Box>
    </ArticleFig>
  );
}
