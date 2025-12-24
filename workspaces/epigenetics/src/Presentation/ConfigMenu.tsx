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
    value: dataConfig.genotype_size,
    min: 10,
    max: 500,
    step: 100,
    onChange: (value) => handleSetDataConfig({ genotype_size: value }),
  };

  const phenotypeSizeConfig: MenuConfigEntryNumber = {
    label: 'Phenotype size',
    icon: CircleIcon,
    type: 'number',
    value: dataConfig.phenotype_size,
    min: 10,
    max: 500,
    step: 100,
    onChange: (value) => handleSetDataConfig({ phenotype_size: value }),
  };

  const epistasisEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Epistasis edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.epistasis_edges_min,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasis_edges_min: value }),
  };

  const epistasisEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Epistasis edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.epistasis_edges_max,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasis_edges_max: value }),
  };

  const regionalEnvironmentCountConfig: MenuConfigEntryNumber = {
    label: 'Regional env count',
    icon: NetworkIcon,
    type: 'number',
    value: dataConfig.regional_env_count,
    min: 1,
    max: 20,
    step: 1,
    onChange: (value) => handleSetDataConfig({ regional_env_count: value }),
  };

  const regionalEnvironmentEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Regional env edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.regional_env_epi_edges_min,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({
        regional_env_epi_edges_min: value,
      }),
  };

  const regionalEnvironmentEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Regional env edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.regional_env_epi_edges_max,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({
        regional_env_epi_edges_max: value,
      }),
  };

  const globalEnvironmentEdgesMinConfig: MenuConfigEntryNumber = {
    label: 'Global env edges min',
    icon: MinusIcon,
    type: 'number',
    value: dataConfig.global_env_epi_edges_min,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({ global_env_epi_edges_min: value }),
  };

  const globalEnvironmentEdgesMaxConfig: MenuConfigEntryNumber = {
    label: 'Global env edges max',
    icon: PlusIcon,
    type: 'number',
    value: dataConfig.global_env_epi_edges_max,
    min: 0,
    max: 1,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) =>
      handleSetDataConfig({ global_env_epi_edges_max: value }),
  };

  const epistasisGainConfig: MenuConfigEntryNumber = {
    label: 'Epistasis gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.epistasis_gain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ epistasis_gain: value }),
  };

  const phenotypeGainConfig: MenuConfigEntryNumber = {
    label: 'Phenotype gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.phenotype_gain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ phenotype_gain: value }),
  };

  const regionalEnvironmentGainConfig: MenuConfigEntryNumber = {
    label: 'Regional env gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.regional_env_epi_gain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ regional_env_epi_gain: value }),
  };

  const globalEnvironmentGainConfig: MenuConfigEntryNumber = {
    label: 'Global env gain',
    icon: GaugeIcon,
    type: 'number',
    value: dataConfig.global_env_epi_gain,
    min: 0,
    max: 10,
    step: 0.1,
    formatter: (value) => value.toFixed(1),
    onChange: (value) => handleSetDataConfig({ global_env_epi_gain: value }),
  };

  const reproductionSearchRadiusConfig: MenuConfigEntryNumber = {
    label: 'Reproduction search radius',
    icon: NetworkIcon,
    type: 'number',
    value: dataConfig.reproduction_search_radius,
    min: 1,
    max: 10,
    step: 1,
    formatter: (value) => `${value} layer${value !== 1 ? 's' : ''}`,
    onChange: (value) =>
      handleSetDataConfig({ reproduction_search_radius: value }),
  };

  const cellSizeConfig: MenuConfigEntryNumber = {
    label: 'Cell size',
    icon: CircleIcon,
    type: 'number',
    value: dataConfig.cell_size,
    min: 1,
    max: 50,
    step: 1,
    formatter: (value) => `${value}x${value} pixels`,
    onChange: (value) => handleSetDataConfig({ cell_size: value }),
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
