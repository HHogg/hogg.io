import { GaugeIcon } from 'lucide-react';
import {
  Box,
  ConfigMenu as PreshapeConfigMenu,
  MenuConfigEntryNumber,
} from 'preshape';
import { useState, PointerEvent, useCallback } from 'react';
import { getSimulationWorker } from '../worker/simulationWorker';
import { UseMessageHandlerResult } from '../worker/useMessageHandler';

interface ConfigMenuProps {
  messageHandler: UseMessageHandlerResult;
  isConfigMenuOpen: boolean;
}

export default function ConfigMenu({
  messageHandler,
  isConfigMenuOpen,
}: ConfigMenuProps) {
  const [postUpdateInterval, setPostUpdateInterval] = useState(60);

  const handleSetPostUpdateInterval = useCallback(
    async (value: number) => {
      setPostUpdateInterval(value);
      try {
        const simulationWorker = getSimulationWorker(
          messageHandler.onError,
          messageHandler.onMessage
        );
        await simulationWorker.setPostUpdateInterval(value);
      } catch (error) {
        messageHandler.onError(error as string);
      }
    },
    [messageHandler]
  );

  const postUpdateIntervalConfig: MenuConfigEntryNumber = {
    label: 'Update interval',
    icon: GaugeIcon,
    type: 'number',
    value: postUpdateInterval,
    min: 60,
    max: 60 * 5,
    step: 60,
    formatter: (value) => `${value} frames`,
    onChange: handleSetPostUpdateInterval,
  };

  return (
    <Box
      absolute="bottom-right"
      padding="x6"
      onClick={(e: PointerEvent) => e.stopPropagation()}
      style={{ pointerEvents: isConfigMenuOpen ? undefined : 'none' }}
      zIndex={10}
    >
      <PreshapeConfigMenu
        config={[postUpdateIntervalConfig]}
        visible={isConfigMenuOpen}
      />
    </Box>
  );
}
