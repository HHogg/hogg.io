import {
  ColorMode,
  ColorPalette,
  FeatureToggle,
  Layer,
  ScaleMode,
} from '@hogg/wasm';
import {
  GaugeIcon,
  LayersIcon,
  PaintBucketIcon,
  PaletteIcon,
  Repeat1Icon,
  RotateCwIcon,
  ScalingIcon,
  ListRestartIcon,
  ToggleLeftIcon,
} from 'lucide-react';
import {
  Box,
  ConfigMenu,
  MenuConfigEntryAction,
  MenuConfigEntryBoolean,
  MenuConfigEntryManyOf,
  MenuConfigEntryNumber,
  MenuConfigEntryOneOf,
} from 'preshape';
import { useSettingsContext } from './useSettingsContext';

const layersOptions = Object.values(Layer).sort((a, b) => a.localeCompare(b));
const featureTogglesOptions = Object.values(FeatureToggle).sort((a, b) =>
  a.localeCompare(b)
);

export default function Settings() {
  const {
    autoRotate,
    colorMode,
    colorPalette,
    expansionPhases,
    featureToggles,
    scaleMode,
    showLayers,
    showSettings,
    speed,
    setAutoRotate,
    setColorMode,
    setColorPalette,
    setExpansionPhases,
    setFeatureToggles,
    setScaleMode,
    setShowLayers,
    setSpeed,
    resetAllSettings,
  } = useSettingsContext();

  const handleLayersChange = (layers: Layer[]) => {
    setShowLayers(
      layersOptions.reduce(
        (acc, layer) => ({
          ...acc,
          [layer]: layers.includes(layer),
        }),
        {} as typeof showLayers
      )
    );
  };

  const handleFeatureTogglesChange = (featureTogglesNext: FeatureToggle[]) => {
    setFeatureToggles(
      featureTogglesOptions.reduce(
        (acc, featureToggle) => ({
          ...acc,
          [featureToggle]: featureTogglesNext.includes(featureToggle),
        }),
        {} as typeof featureToggles
      )
    );
  };

  const expansionPhasesConfig: MenuConfigEntryNumber = {
    label: 'Expansion phases',
    icon: Repeat1Icon,
    type: 'number',
    value: expansionPhases,
    min: 0,
    max: 20,
    step: 2,
    onChange: setExpansionPhases,
  };

  const speedConfig: MenuConfigEntryOneOf<number> = {
    label: 'Speed',
    icon: GaugeIcon,
    type: 'oneOf',
    value: speed,
    options: [0.25, 0.5, 1, 2, 4],
    formatter: (value) => value * 100 + '%',
    onChange: setSpeed,
  };

  const colorModeConfig: MenuConfigEntryOneOf<ColorMode> = {
    label: 'Color mode',
    icon: PaintBucketIcon,
    type: 'oneOf',
    value: colorMode,
    options: Object.values(ColorMode),
    onChange: setColorMode,
  };

  const colorPaletteConfig: MenuConfigEntryOneOf<ColorPalette> = {
    label: 'Color palette',
    icon: PaletteIcon,
    type: 'oneOf',
    value: colorPalette,
    options: Object.values(ColorPalette),
    onChange: setColorPalette,
  };

  const autoRotateConfig: MenuConfigEntryBoolean = {
    label: 'Auto rotate',
    icon: RotateCwIcon,
    type: 'boolean',
    value: autoRotate,
    labelTrue: 'On',
    labelFalse: 'Off',
    onChange: setAutoRotate,
  };

  const scaleModeConfig: MenuConfigEntryOneOf<ScaleMode> = {
    label: 'Scale mode',
    icon: ScalingIcon,
    type: 'oneOf',
    value: scaleMode,
    options: Object.values(ScaleMode),
    onChange: setScaleMode,
  };

  const showLayersConfig: MenuConfigEntryManyOf<Layer> = {
    label: 'Layers',
    icon: LayersIcon,
    type: 'manyOf',
    value: Object.keys(showLayers).filter(
      (key) => showLayers[key as Layer]
    ) as Layer[],
    options: layersOptions,
    onChange: handleLayersChange,
  };

  const resetPlayer: MenuConfigEntryAction = {
    label: 'Reset',
    icon: ListRestartIcon,
    type: 'action',
    onAction: resetAllSettings,
  };

  const featureTogglesConfig: MenuConfigEntryManyOf<FeatureToggle> = {
    label: 'Feature toggles',
    icon: ToggleLeftIcon,
    type: 'manyOf',
    value: Object.keys(featureToggles).filter(
      (key) => featureToggles[key as FeatureToggle]
    ) as FeatureToggle[],
    options: featureTogglesOptions,
    onChange: handleFeatureTogglesChange,
  };

  return (
    <Box
      absolute="bottom-right"
      onClick={(e) => e.stopPropagation()}
      padding="x6"
      style={{ pointerEvents: showSettings ? undefined : 'none' }}
      zIndex={1}
    >
      <ConfigMenu
        config={[
          autoRotateConfig,
          colorModeConfig,
          colorPaletteConfig,
          expansionPhasesConfig,
          featureTogglesConfig,
          showLayersConfig,
          scaleModeConfig,
          speedConfig,
          resetPlayer,
        ].sort((a, b) => {
          if (a.type === 'action' && b.type !== 'action') {
            return 1;
          }

          return a.label.localeCompare(b.label);
        })}
        visible={showSettings}
      />
    </Box>
  );
}
