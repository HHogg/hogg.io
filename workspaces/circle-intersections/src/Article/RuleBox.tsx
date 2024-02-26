import { ChevronRightIcon } from 'lucide-react';
import { Box, Link, Motion, Text, Button } from 'preshape';

interface Props {
  description: string;
  onClick: () => void;
  number: number;
  title: string;
}

const RuleBox = ({ description, onClick, number, title }: Props) => {
  return (
    <Motion
      whileHover={{
        scale: 1.05,
      }}
    >
      <Button
        align="start"
        alignChildrenVertical="middle"
        backgroundColor="background-shade-2"
        borderRadius="x3"
        borderColor="background-shade-4"
        borderSize="x1"
        clickable
        flex="horizontal"
        gap="x6"
        onClick={onClick}
        paddingHorizontal="x6"
        paddingVertical="x3"
        size="x3"
        variant="tertiary"
        weight="x1"
        width="100%"
      >
        <Box>
          <Text align="middle" size="x5" weight="x2">
            {number}
          </Text>
        </Box>

        <Box basis="0" grow>
          <Text weight="x5">{title}</Text>
          <Text>{description}</Text>
        </Box>

        <Box>
          <Link borderRadius="x2" color="accent" padding="x4">
            <ChevronRightIcon size="2rem" />
          </Link>
        </Box>
      </Button>
    </Motion>
  );
};

export default RuleBox;
