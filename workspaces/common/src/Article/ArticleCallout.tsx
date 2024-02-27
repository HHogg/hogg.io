import { InfoIcon } from 'lucide-react';
import { Box, Text, TextProps } from 'preshape';
import { PropsWithChildren } from 'react';

type Props = {
  title: string;
};

export default function ArticleCallout({
  children,
  title,
  ...rest
}: PropsWithChildren<Props & TextProps>) {
  return (
    <Text
      {...rest}
      padding="x6"
      backgroundColor="accent-shade-1"
      borderRadius="x3"
      borderSize="x1"
      borderColor="accent-shade-2"
      margin="x6"
      container
    >
      <Box
        absolute="top-right"
        backgroundColor="background-shade-1"
        borderRadius="50%"
        borderColor="accent-shade-2"
        borderSize="x1"
        padding="x2"
        style={{ transform: 'translate(50%, -50%)' }}
        textColor="accent-shade-3"
      >
        <InfoIcon size="1.5rem" />
      </Box>

      <Box>
        <Text size="x5" weight="x2" margin="x4">
          {title}
        </Text>

        <Text>{children}</Text>
      </Box>
    </Text>
  );
}
