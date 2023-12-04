import { Input, Tooltip } from 'preshape';
import { useArrangementContext } from '../Arrangement/useArrangementContext';
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
        size="x6"
        onChange={handleInputChange}
        placeholder="Notation"
        placeholderTextColor="text-shade-4"
        value={notation}
        maxWidth="500px"
      />
    </Tooltip>
  );
}
