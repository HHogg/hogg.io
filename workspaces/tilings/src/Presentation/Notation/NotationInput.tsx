import { Box, Input, Tooltip } from 'preshape';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import NotationInputFindButton from './NotationInputFindButton';
import { useNotationContext } from './useNotationContext';

export default function NotationInput() {
  const { notation, setNotation } = useNotationContext();
  const { tiling } = useArrangementContext();
  const error = tiling?.error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNotation(value);
  };

  return (
    <Box flex="horizontal" alignChildrenVertical="middle">
      <Box>
        <NotationInputFindButton id="findPreviousTiling" />
      </Box>

      <Tooltip
        backgroundColor="negative-shade-4"
        content={error}
        placement="bottom"
        textColor="light-shade-1"
        visible={!!error}
      >
        <Input
          align="middle"
          backgroundColor="transparent"
          basis="0"
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
        <NotationInputFindButton id="findNextTiling" />
      </Box>
    </Box>
  );
}
