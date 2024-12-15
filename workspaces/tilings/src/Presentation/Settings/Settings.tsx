import { ColorPalette, Layer, ScaleMode } from '@hogg/wasm';
import {
  GaugeIcon,
  LayersIcon,
  PaletteIcon,
  Repeat1Icon,
  RotateCwIcon,
  ScalingIcon,
} from 'lucide-react';
import {
  Box,
  ConfigMenu,
  MenuConfigEntryBoolean,
  MenuConfigEntryManyOf,
  MenuConfigEntryNumber,
  MenuConfigEntryOneOf,
} from 'preshape';
import { SPEEDS, Speed } from '../Player/usePlayer';
import { usePlayerContext } from '../Player/usePlayerContext';
import { useSettingsContext } from './useSettingsContext';

const layersOptions = Object.values(Layer).sort((a, b) => a.localeCompare(b));

export default function Settings() {
  const {
    autoRotate,
    colorPalette,
    expansionPhases,
    scaleMode,
    showLayers,
    showSettings,
    setAutoRotate,
    setColorPalette,
    setExpansionPhases,
    setScaleMode,
    setShowLayers,
  } = useSettingsContext();
  const { speed, setSpeed } = usePlayerContext();

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

  const expansionPhasesConfig: MenuConfigEntryNumber = {
    label: 'Expansion phases',
    icon: Repeat1Icon,
    type: 'number',
    value: expansionPhases,
    min: 0,
    max: 20,
    step: 5,
    onChange: setExpansionPhases,
  };

  const speedConfig: MenuConfigEntryOneOf<Speed> = {
    label: 'Speed',
    icon: GaugeIcon,
    type: 'oneOf',
    value: speed,
    options: SPEEDS,
    formatter: (value) => value * 100 + '%',
    onChange: setSpeed,
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
          colorPaletteConfig,
          expansionPhasesConfig,
          showLayersConfig,
          scaleModeConfig,
          speedConfig,
        ].sort((a, b) => a.label.localeCompare(b.label))}
        visible={showSettings}
      />
    </Box>
  );
}
