import { TilingError } from '@hogg/wasm';
import { Appear, Box, Input, Text } from 'preshape';
import { useRef } from 'react';
import { usePlayerContext } from '../Player/usePlayerContext';
import NotationInputFindButton from './NotationInputFindButton';
import { useNotationContext } from './useNotationContext';

const tilingErrorToString = (error: TilingError | null) => {
  if (!error) {
    return '';
  }

  return `${error?.name}: ${Object.entries(error?.data)
    .map(([key, value]) => `[${key}=${JSON.stringify(value)}]`)
    .join(' ')}`;
};

export default function NotationInput() {
  const { notation, setNotation } = useNotationContext();
  const { renderResult } = usePlayerContext();
  const error = renderResult?.error ?? null;
  const refErrorString = useRef(tilingErrorToString(error));

  const handleClearInput = () => {
    if (notation) {
      setNotation(notation);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNotation(value);
  };

  if (error && refErrorString.current !== tilingErrorToString(error)) {
    refErrorString.current = tilingErrorToString(error);
  }

  return (
    <Box
      backgroundColor="background-shade-2"
      borderColor={error ? 'negative-shade-4' : 'background-shade-4'}
      borderSize="x1"
      borderRadius="x3"
      padding="x3"
    >
      <Box flex="horizontal" alignChildrenVertical="middle">
        <Box>
          <NotationInputFindButton id="previous" />
        </Box>

        <Input
          align="middle"
          backgroundColor="transparent"
          basis="0"
          borderSize="x0"
          borderRadius="x0"
          grow
          size="x5"
          onChange={handleInputChange}
          onClick={handleClearInput}
          placeholder="Notation"
          placeholderTextColor="text-shade-3"
          value={notation}
          maxWidth="500px"
          minWidth="300px"
          textColor={error ? 'negative-shade-4' : 'text-shade-1'}
        />

        <Box>
          <NotationInputFindButton id="next" />
        </Box>
      </Box>

      <Appear animation="Expand" visible={!!error}>
        <Text align="middle" size="x2" weight="x2" textColor="negative-shade-4">
          {refErrorString.current}
        </Text>
      </Appear>
    </Box>
  );
}
