import { GaugeIcon, LayersIcon } from 'lucide-react';
import {
  Box,
  ConfigMenu as PreshapeConfigMenu,
  MenuConfigEntryNumber,
  MenuConfigEntryOneOf,
} from 'preshape';
import { useState, PointerEvent, useCallback, useEffect } from 'react';
import { UseSimulationWorkerResult } from '../worker/useSimulationWorker';

interface ConfigMenuProps {
  simulationWorker: UseSimulationWorkerResult;
  isConfigMenuOpen: boolean;
}

export default function ConfigMenu({
  simulationWorker,
  isConfigMenuOpen,
}: ConfigMenuProps) {
  const [postUpdateInterval, setPostUpdateInterval] = useState(60);
  const [maxTextureDepth, setMaxTextureDepth] = useState<number | null>(null);
  const [textureDepth, setTextureDepth] = useState<number | null>(null);
  const { getSimulationWorker, isInitialized } = simulationWorker;

  const handleSetPostUpdateInterval = useCallback(
    async (value: number) => {
      const simulationWorker = getSimulationWorker();
      setPostUpdateInterval(value);
      await simulationWorker.setPostUpdateInterval(value);
    },
    [getSimulationWorker]
  );

  const handleSetTextureDepth = useCallback(
    async (value: number) => {
      const simulationWorker = getSimulationWorker();
      setTextureDepth(value);
      await simulationWorker.setTextureDepth(value);
    },
    [getSimulationWorker]
  );

  // Fetch max depth and current depth on mount and after simulation init
  useEffect(() => {
    const fetchDepths = async () => {
      if (!isInitialized) {
        return;
      }
      const simulationWorker = getSimulationWorker();
      try {
        const max = await simulationWorker.getMaxTextureDepth();
        setMaxTextureDepth(max);
        // Get current depth from simulation program
        const current = await simulationWorker.getTextureDepth();
        setTextureDepth(current);
      } catch (error) {
        console.error('Failed to get texture depth:', error);
      }
    };
    fetchDepths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, getSimulationWorker]);

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

  // Generate options based on max depth (factors: max/8, max/4, max/2, max)
  const textureDepthOptions = maxTextureDepth
    ? [
        Math.floor(maxTextureDepth / 8),
        Math.floor(maxTextureDepth / 4),
        Math.floor(maxTextureDepth / 2),
        maxTextureDepth,
      ].filter((v, i, arr) => v > 0 && (i === 0 || v !== arr[i - 1])) // Remove duplicates and zeros
    : [];

  const textureDepthConfig: MenuConfigEntryOneOf<number> | null =
    maxTextureDepth && textureDepth !== null
      ? {
          label: 'Texture depth',
          icon: LayersIcon,
          type: 'oneOf',
          value: textureDepth,
          options: textureDepthOptions,
          formatter: (value) => `${value} layers`,
          onChange: handleSetTextureDepth,
        }
      : null;

  const configEntries = [
    postUpdateIntervalConfig,
    ...(textureDepthConfig ? [textureDepthConfig] : []),
  ];

  return (
    <Box
      absolute="bottom-right"
      padding="x6"
      onClick={(e: PointerEvent) => e.stopPropagation()}
      style={{ pointerEvents: isConfigMenuOpen ? undefined : 'none' }}
      zIndex={10}
    >
      <PreshapeConfigMenu config={configEntries} visible={isConfigMenuOpen} />
    </Box>
  );
}
