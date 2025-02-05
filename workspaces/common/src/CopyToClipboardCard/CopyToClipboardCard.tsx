import {
  ClipboardCheckIcon,
  ClipboardCopyIcon,
  ClipboardXIcon,
} from 'lucide-react';
import { Button, Box, Text, ButtonProps, Appear, Tooltip } from 'preshape';
import useCopyToClipboard from './useCopyToClipboard';

type Props = {
  text: string;
};

export default function CopyToClipboardCard({
  text,
  ...rest
}: ButtonProps & Props) {
  const { canCopy, copy, hasCopied, hasFailed } = useCopyToClipboard();

  return (
    <Button
      {...rest}
      align="start"
      alignChildrenHorizontal="start"
      backgroundColor="background-shade-2"
      backgroundColorHover="background-shade-2"
      backgroundColorActive="background-shade-2"
      borderRadius="10px"
      borderSize="x1"
      borderColor="background-shade-4"
      gap="x4"
      onClick={() => copy(text)}
      paddingHorizontal="x8"
      paddingVertical="x4"
      textColor="text-shade-1"
      textColorHover="text-shade-1"
      textColorActive="text-shade-1"
      weight="x1"
      width="100%"
    >
      <Box basis="0" grow minWidth={0} title={text}>
        <Text monospace weight="x2" ellipsis>
          {text}
        </Text>
      </Box>

      {canCopy && (
        <Box container>
          <Appear animation="Pop" visible={!hasCopied && !hasFailed}>
            <ClipboardCopyIcon />
          </Appear>

          <Tooltip
            backgroundColor="positive-shade-5"
            borderRadius="x2"
            content="Copied to Clipboard 👍"
            visible={hasCopied}
            textColor="white"
          >
            <Box absolute="center">
              <Appear
                animation="Pop"
                visible={hasCopied}
                textColor="positive-shade-4"
              >
                <ClipboardCheckIcon />
              </Appear>
            </Box>
          </Tooltip>

          <Box absolute="center">
            <Appear
              animation="Pop"
              visible={hasFailed}
              textColor="negative-shade-4"
            >
              <ClipboardXIcon />
            </Appear>
          </Box>
        </Box>
      )}
    </Button>
  );
}
