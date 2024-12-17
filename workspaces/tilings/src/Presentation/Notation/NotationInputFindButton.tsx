import { useWasmApi } from '@hogg/wasm';
import { useWasmAddEventListener } from '@hogg/wasm/src/WasmApi/useWasmAddEventListener';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ButtonAsync, Text, Tooltip } from 'preshape';
import { useCallback, useEffect, useState } from 'react';
import { formatNumber } from '../utils/formatting';
import { useNotationContext } from './useNotationContext';

type NotationInputFindButtonProps = {
  id: 'findNextTiling' | 'findPreviousTiling';
};

export default function NotationInputFindButton({
  id,
}: NotationInputFindButtonProps) {
  const { previousNotation, nextNotation } = useNotationContext();
  const { errors, loadings } = useWasmApi();

  const action = id === 'findNextTiling' ? nextNotation : previousNotation;
  const error = errors[id];
  const loading = loadings[id];

  const [found, setFound] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setFound(false);
    setCount(0);
    action();
  };

  useWasmAddEventListener(
    id,
    useCallback(() => {
      setCount((prevCount) => prevCount + 1);
    }, [])
  );

  useEffect(() => {
    if (loading) {
      setIsTooltipVisible(true);
    } else {
      setFound(true);

      const timeout = setTimeout(() => {
        setIsTooltipVisible(false);
      }, 5_000);

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  return (
    <Tooltip
      visible={isTooltipVisible}
      placement="bottom"
      content={
        found ? (
          <Text>
            <Text>✅ Found</Text>
            <Text weight="x1">Checked {formatNumber(count)} tilings</Text>
          </Text>
        ) : (
          <Text>
            <Text>🔎 Searching</Text>
            <Text weight="x1">Checked {formatNumber(count)} tilings</Text>
          </Text>
        )
      }
    >
      <ButtonAsync
        disabled={
          loadings.findNextTiling ??
          loadings.findPreviousTiling ??
          loadings.renderTiling ??
          false
        }
        error={error}
        isError={!!error}
        isLoading={loading ?? false}
        padding="x1"
        variant="tertiary"
        onClick={handleClick}
      >
        {id === 'findNextTiling' ? (
          <ChevronRightIcon size="2rem" />
        ) : (
          <ChevronLeftIcon size="2rem" />
        )}
      </ButtonAsync>
    </Tooltip>
  );
}
