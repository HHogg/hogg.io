import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Box, Button, Input, Tooltip } from 'preshape';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from './useNotationContext';

export default function NotationInput() {
  const { notation, setNotation, previousNotation, nextNotation } =
    useNotationContext();
  const { tiling } = useArrangementContext();
  const error = tiling?.error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNotation(value);
  };

  return (
    <Box flex="horizontal" alignChildrenVertical="middle">
      <Box>
        <Button padding="x1" variant="tertiary" onClick={previousNotation}>
          <ChevronLeftIcon size="2rem" />
        </Button>
      </Box>

      <Tooltip
        backgroundColor="negative-shade-4"
        content={error}
        placement="bottom"
        textColor="white"
        visible={!!error}
      >
        <Input
          align="middle"
          backgroundColor="transparent"
          borderColor={error ? 'negative-shade-4' : 'text-shade-1'}
          borderBottom
          borderSize="x3"
          borderRadius="x0"
          grow
          size="x6"
          onChange={handleInputChange}
          placeholder="Notation"
          placeholderTextColor="text-shade-3"
          value={notation}
          maxWidth="500px"
        />
      </Tooltip>

      <Box>
        <Button padding="x1" variant="tertiary" onClick={nextNotation}>
          <ChevronRightIcon size="2rem" />
        </Button>
      </Box>
    </Box>
  );
}
