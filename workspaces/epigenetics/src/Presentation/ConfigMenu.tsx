import {
  GaugeIcon,
  GlobeIcon,
  ChevronsLeftRightEllipsisIcon,
  ToggleRightIcon,
  LandPlotIcon,
  SquareIcon,
  GitMergeIcon,
  BabyIcon,
  DnaIcon,
  FootprintsIcon,
} from 'lucide-react';
import {
  Box,
  ConfigMenu as PreshapeConfigMenu,
  MenuConfigEntrySubmenu,
} from 'preshape';
import { PointerEvent } from 'react';
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
  const { updateDataConfig, dataConfig } = simulationWorker;

  const handleSetDataConfig = (updates: Partial<DataConfig>) => {
    updateDataConfig(updates);
  };

  if (!dataConfig) {
    return null;
  }

  const formatterGain = (value: number) => `${value.toFixed(2)}`;
  const formatterEdges = (value: number) => `${(value * 100).toFixed(0)}%`;
  const formatterShift = (value: number) => `${value.toFixed(2)}`;

  const geneticComplexitySubmenuConfig: MenuConfigEntrySubmenu = {
    label: 'Genetic complexity',
    description: 'Configuration for the genetic complexity of the simulation.',
    icon: DnaIcon,
    type: 'submenu',
    config: [
      {
        label: 'Cell size',
        icon: SquareIcon,
        type: 'range',
        value: dataConfig.cellSize,
        min: 1,
        max: 50,
        step: 1,
        onChange: (value) => handleSetDataConfig({ cellSize: value }),
        formatter: (value) => `${value}`,
      },
      {
        label: 'Genotype size',
        description: 'The number of genotypical traits in each cell.',
        icon: DnaIcon,
        type: 'range',
        value: dataConfig.genotypeSize,
        min: 1,
        max: 100,
        step: 1,
        onChange: (value) => handleSetDataConfig({ genotypeSize: value }),
        formatter: (value) => `${value}`,
      },
      {
        label: 'Phenotype size',
        description: 'The number of phenotypical traits in each cell.',
        icon: FootprintsIcon,
        type: 'range',
        value: dataConfig.phenotypeSize,
        min: 1,
        max: 100,
        step: 1,
        onChange: (value) => handleSetDataConfig({ phenotypeSize: value }),
        formatter: (value) => `${value}`,
      },
    ],
  };

  const epistasisSubmenuConfig: MenuConfigEntrySubmenu = {
    label: 'Epistasis',
    description:
      'Configuration for how the genotypical traits interact with each other.',
    type: 'submenu',
    icon: ChevronsLeftRightEllipsisIcon,
    config: [
      {
        label: 'Enabled',
        icon: ToggleRightIcon,
        type: 'boolean',
        value: dataConfig.epistasisEnabled,
        labelTrue: 'Yes',
        labelFalse: 'No',
        onChange: (value) => handleSetDataConfig({ epistasisEnabled: value }),
      },
      {
        label: 'Edges',
        description:
          'The range of edges that are randomly selected for each genotypical trait.',
        icon: GitMergeIcon,
        type: 'range',
        value: [dataConfig.epistasisEdgesMin, dataConfig.epistasisEdgesMax],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            epistasisEdgesMin: value[0],
            epistasisEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Gain',
        description:
          'A multiplier for the epistasis effect that can be used to dampen the effect.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.epistasisGain,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => handleSetDataConfig({ epistasisGain: value }),
        formatter: formatterGain,
      },
    ],
  };

  const regionalEnvironmentSubmenuConfig: MenuConfigEntrySubmenu = {
    type: 'submenu',
    label: 'Regional environment',
    icon: LandPlotIcon,
    config: [
      {
        label: 'Enabled',
        icon: ToggleRightIcon,
        type: 'boolean',
        value: dataConfig.regionalEnvEnabled,
        labelTrue: 'Yes',
        labelFalse: 'No',
        onChange: (value) => handleSetDataConfig({ regionalEnvEnabled: value }),
      },
      {
        label: 'Edges (Epigenetic)',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.regionalEnvEpiEdgesMin,
          dataConfig.regionalEnvEpiEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            regionalEnvEpiEdgesMin: value[0],
            regionalEnvEpiEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Edges (Fitness)',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.regionalEnvFitEdgesMin,
          dataConfig.regionalEnvFitEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            regionalEnvFitEdgesMin: value[0],
            regionalEnvFitEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Gain',
        description:
          'A multiplier for the regional environment epigenetic effect that can be used to dampen the effect.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.regionalEnvEpiGain,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => handleSetDataConfig({ regionalEnvEpiGain: value }),
        formatter: formatterGain,
      },
    ],
  };

  const globalEnvironmentSubmenuConfig: MenuConfigEntrySubmenu = {
    type: 'submenu',
    label: 'Global environment',
    icon: GlobeIcon,
    config: [
      {
        label: 'Enabled',
        icon: ToggleRightIcon,
        type: 'boolean',
        value: dataConfig.globalEnvEnabled,
        labelTrue: 'Yes',
        labelFalse: 'No',
        onChange: (value) => handleSetDataConfig({ globalEnvEnabled: value }),
      },
      {
        label: 'Edges (Epigenetic)',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.globalEnvEpiEdgesMin,
          dataConfig.globalEnvEpiEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            globalEnvEpiEdgesMin: value[0],
            globalEnvEpiEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Edges (Fitness)',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.globalEnvFitEdgesMin,
          dataConfig.globalEnvFitEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            globalEnvFitEdgesMin: value[0],
            globalEnvFitEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Gain',
        description:
          'A multiplier for the global environment epigenetic effect that can be used to dampen the effect.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.globalEnvEpiGain,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => handleSetDataConfig({ globalEnvEpiGain: value }),
        formatter: formatterGain,
      },
    ],
  };

  const reproductionSubmenuConfig: MenuConfigEntrySubmenu = {
    type: 'submenu',
    label: 'Reproduction',
    icon: BabyIcon,
    config: [
      {
        label: 'Opportunities max',
        description:
          'Maximum number of partnership opportunities to evaluate per cell.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.partnershipOpportunitiesMax,
        min: 1,
        max: 50,
        step: 1,
        onChange: (value) =>
          handleSetDataConfig({ partnershipOpportunitiesMax: value }),
        formatter: (value) => `${value}`,
      },
      {
        label: 'Fitness amplification',
        description:
          'Amplifies fitness acceptance: 1 = maximum, -1 = minimum, 0 = unchanged.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.partnershipFitnessAmplification,
        min: -1,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({ partnershipFitnessAmplification: value }),
        formatter: formatterShift,
      },
      {
        label: 'Fitness edges',
        description: 'The range of edges for fitness acceptance calculation.',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.partnershipFitnessEdgesMin,
          dataConfig.partnershipFitnessEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.0001,
        onChange: (value) =>
          handleSetDataConfig({
            partnershipFitnessEdgesMin: value[0],
            partnershipFitnessEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
      {
        label: 'Monogamy amplification',
        description:
          'Amplifies monogamous weight: 1 = maximum, -1 = minimum, 0 = unchanged.',
        icon: GaugeIcon,
        type: 'range',
        value: dataConfig.partnershipMonogamyAmplification,
        min: -1,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({ partnershipMonogamyAmplification: value }),
        formatter: formatterShift,
      },
      {
        label: 'Monogamy edges',
        description: 'The range of edges for monogamous weight calculation.',
        icon: GitMergeIcon,
        type: 'range',
        value: [
          dataConfig.partnershipMonogamyEdgesMin,
          dataConfig.partnershipMonogamyEdgesMax,
        ],
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) =>
          handleSetDataConfig({
            partnershipMonogamyEdgesMin: value[0],
            partnershipMonogamyEdgesMax: value[1],
          }),
        formatter: formatterEdges,
      },
    ],
  };

  const configEntries = [
    geneticComplexitySubmenuConfig,
    epistasisSubmenuConfig,
    regionalEnvironmentSubmenuConfig,
    globalEnvironmentSubmenuConfig,
    reproductionSubmenuConfig,
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
