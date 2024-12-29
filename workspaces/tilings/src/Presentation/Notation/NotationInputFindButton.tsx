import { useWasmApi } from '@hogg/wasm';
import { useWasmAddEventListener } from '@hogg/wasm/src/WasmApi/useWasmAddEventListener';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ButtonAsync, Text, Tooltip } from 'preshape';
import { useCallback, useEffect, useState } from 'react';
import { formatNumber } from '../utils/formatting';
import { useNotationContext } from './useNotationContext';

type NotationInputFindButtonProps = {
  id: 'previous' | 'next';
};

export default function NotationInputFindButton({
  id,
}: NotationInputFindButtonProps) {
  const { previousNotation, nextNotation } = useNotationContext();
  const { errors, loadings } = useWasmApi();

  const actionId =
    id === 'next' ? 'tilings.findNextTiling' : 'tilings.findPreviousTiling';
  const eventName = id === 'next' ? 'findNextTiling' : 'findPreviousTiling';

  const action = id === 'next' ? nextNotation : previousNotation;

  const error = errors[actionId];
  const loading = loadings[actionId];

  const [found, setFound] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setFound(false);
    setCount(0);
    action();
  };

  useWasmAddEventListener(
    eventName,
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
          loadings['tilings.findNextTiling'] ??
          loadings['tilings.findPreviousTiling'] ??
          loadings['tilings.renderTiling'] ??
          false
        }
        error={error}
        isError={!!error}
        isLoading={loading ?? false}
        padding="x1"
        variant="tertiary"
        onClick={handleClick}
      >
        {id === 'next' ? (
          <ChevronRightIcon size="1.5rem" />
        ) : (
          <ChevronLeftIcon size="1.5rem" />
        )}
      </ButtonAsync>
    </Tooltip>
  );
}
