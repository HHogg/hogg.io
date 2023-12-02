import { Box, Text } from 'preshape';

interface Props {
  label: string;
  value: number;
}

const SnakeScoreTile = (props: Props) => {
  const { value, label } = props;

  return (
    <Box
      basis="0"
      borderRadius="x1"
      backgroundColor="background-shade-3"
      grow
      padding="x3"
    >
      <Text align="middle">
        <Text tag="span" size="x5">
          {value}
        </Text>{' '}
        <Text color="shade-3" tag="span" size="x1">
          {label}
        </Text>
      </Text>
    </Box>
  );
};

export default SnakeScoreTile;
