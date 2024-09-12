import { useWasmApi } from '@hogg/wasm';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Box, ButtonAsync, Input, Tooltip } from 'preshape';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
import { useNotationContext } from './useNotationContext';

export default function NotationInput() {
  const { notation, setNotation, previousNotation, nextNotation } =
    useNotationContext();
  const { tiling } = useArrangementContext();
  const { errors, loading } = useWasmApi();
  const error = tiling?.error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNotation(value);
  };

  return (
    <Box flex="horizontal" alignChildrenVertical="middle">
      <Box>
        <ButtonAsync
          error={errors.findPreviousTiling}
          isError={!!errors.findPreviousTiling}
          isLoading={loading.findPreviousTiling ?? false}
          padding="x1"
          variant="tertiary"
          onClick={previousNotation}
        >
          <ChevronLeftIcon size="2rem" />
        </ButtonAsync>
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
        <ButtonAsync
          error={errors.findNextTiling}
          isError={!!errors.findNextTiling}
          isLoading={loading.findNextTiling ?? false}
          padding="x1"
          variant="tertiary"
          onClick={nextNotation}
        >
          <ChevronRightIcon size="2rem" />
        </ButtonAsync>
      </Box>
    </Box>
  );
}
