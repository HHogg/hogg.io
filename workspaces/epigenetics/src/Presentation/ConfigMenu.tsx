import {
  GaugeIcon,
  MinusIcon,
  PlusIcon,
  CircleIcon,
  NetworkIcon,
} from 'lucide-react';
import {
  Box,
  ConfigMenu as PreshapeConfigMenu,
  MenuConfigEntryNumber,
} from 'preshape';
import { useState, PointerEvent, useCallback } from 'react';
import { Config as DataConfig } from '../worker/types.generated';
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
  const { getSimulationWorker, dataConfig } = simulationWorker;

  const handleSetPostUpdateInterval = useCallback(
    async (value: number) => {
      const simulationWorker = getSimulationWorker();
      setPostUpdateInterval(value);
      await simulationWorker.setPostUpdateInterval(value);
    },
    [getSimulationWorker]
  );

  const handleSetDataConfig = useCallback(
    async (updates: Partial<DataConfig>) => {
      if (!dataConfig) {
        return;
      }
      const simulationWorker = getSimulationWorker();
      const newConfig = { ...dataConfig, ...updates };
      await simulationWorker.setDataConfig(newConfig);
    },
    [getSimulationWorker, dataConfig]
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

  if (!dataConfig) {
    return null;
  }

  const genotypeSizeConfig: MenuConfigEntryNumber = {
    label: 'Genotype size',
    icon: CircleIcon,
    type: 'number',
    value: dataConfig.genotypeSize,
    min: 10,
    max: 500,
    step: 100,
    onChange: (value) => handleSetDataConfig({ genotypeSize: value }),
  };

  const phenotypeSizeConfig: MenuConfigEntryNumber = {
    label: 'Phenotype size',
    icon: CircleIcon,
    type: 'number',
    value: dataConfig.phenotypeSize,
    min: 10,
    max: 500,
    step: 100,
    onChange: (value) => handleSetDataConfig({ phenotypeSize: value }),
  };

  const epistasisEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Epistasis edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.epistasisEdgesMin,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasisEdgesMin: value }),
  };

  const epistasisEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Epistasis edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.epistasisEdgesMax,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasisEdgesMax: value }),
  };

  const regionalEnvironmentCountConfig: MenuConfigEntryNumber = {
    label: 'Regional env count',
    icon: NetworkIcon,
    type: 'number',
    value: dataConfig.regionalEnvCount,
    min: 1,
    max: 20,
    step: 1,
    onChange: (value) => handleSetDataConfig({ regionalEnvCount: value }),
  };

  const regionalEnvironmentEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Regional env edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.regionalEnvEpiEdgesMin,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({
        regionalEnvEpiEdgesMin: value,
      }),
  };

  const regionalEnvironmentEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Regional env edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.regionalEnvEpiEdgesMax,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({
        regionalEnvEpiEdgesMax: value,
      }),
  };

  const globalEnvironmentEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Global env edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.globalEnvEpiEdgesMin,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ globalEnvEpiEdgesMin: value }),
  };

  const globalEnvironmentEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Global env edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.globalEnvEpiEdgesMax,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ globalEnvEpiEdgesMax: value }),
  };

  const epistasisGainConfig: MenuConfigEntryNumber = {
    label: 'Epistasis gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.epistasisGain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasisGain: value }),
  };

  const phenotypeGainConfig: MenuConfigEntryNumber = {
    label: 'Phenotype gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.phenotypeGain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ phenotypeGain: value }),
  };

  const regionalEnvironmentGainConfig: MenuConfigEntryNumber = {
    label: 'Regional env gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.regionalEnvEpiGain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ regionalEnvEpiGain: value }),
  };

  const globalEnvironmentGainConfig: MenuConfigEntryNumber = {
    label: 'Global env gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.globalEnvEpiGain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ globalEnvEpiGain: value }),
  };

  const reproductionSearchRadiusConfig: MenuConfigEntryNumber = {
    label: 'Reproduction search radius',
    icon: NetworkIcon,
    type: 'number',
    value: dataConfig.reproductionSearchRadius,
    min: 1,
    max: 10,
    step: 1,
    formatter: (value) => `${value} layer${value !== 1 ? 's' : ''}`,
    onChange: (value) =>
      handleSetDataConfig({ reproductionSearchRadius: value }),
  };

  const cellSizeConfig: MenuConfigEntryNumber = {
    label: 'Cell size',
    icon: CircleIcon,
    type: 'number',
    value: dataConfig.cellSize,
    min: 1,
    max: 50,
    step: 1,
    formatter: (value) => `${value}x${value} pixels`,
    onChange: (value) => handleSetDataConfig({ cellSize: value }),
  };

  const configEntries = [
    postUpdateIntervalConfig,
    genotypeSizeConfig,
    phenotypeSizeConfig,
    phenotypeGainConfig,
    epistasisGainConfig,
    epistasisEdgesMinConfig,
    epistasisEdgesMaxConfig,
    regionalEnvironmentGainConfig,
    regionalEnvironmentCountConfig,
    regionalEnvironmentEdgesMinConfig,
    regionalEnvironmentEdgesMaxConfig,
    globalEnvironmentGainConfig,
    globalEnvironmentEdgesMinConfig,
    globalEnvironmentEdgesMaxConfig,
    reproductionSearchRadiusConfig,
    cellSizeConfig,
  ].sort((a, b) => a.label.localeCompare(b.label));

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
