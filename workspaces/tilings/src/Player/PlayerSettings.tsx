import {
  BugIcon,
  GaugeIcon,
  HashIcon,
  HighlighterIcon,
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
import { Annotation, ColorMode, ScaleMode } from '../types';
import { SPEEDS, Speed } from './usePlayer';
import { usePlayerContext } from './usePlayerContext';

const annotationOptions = Object.values(Annotation);

export default function PlayerSettings() {
  const {
    autoRotate,
    colorMode,
    expansionPhases,
    scaleMode,
    scaleSize,
    showAnnotations,
    showDebug,
    showSettings,
    speed,
    setAutoRotate,
    setScaleMode,
    setScaleSize,
    setShowAnnotations,
    setColorMode,
    setExpansionPhases,
    setShowDebug,
    setSpeed,
  } = usePlayerContext();

  const handleAnnotationsChange = (annotations: Annotation[]) => {
    setShowAnnotations(
      annotationOptions.reduce(
        (acc, annotation) => ({
          ...acc,
          [annotation]: annotations.includes(annotation),
        }),
        {} as typeof showAnnotations
      )
    );
  };

  const expansionPhasesConfig: MenuConfigEntryNumber = {
    label: 'Expansion phases',
    icon: Repeat1Icon,
    type: 'number',
    value: expansionPhases,
    min: 0,
    max: 10,
    step: 1,
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

  const annotationsConfig: MenuConfigEntryManyOf<Annotation> = {
    label: 'Annotations',
    icon: HighlighterIcon,
    type: 'manyOf',
    value: Object.keys(showAnnotations).filter(
      (key) => showAnnotations[key as Annotation]
    ) as Annotation[],
    options: annotationOptions,
    onChange: handleAnnotationsChange,
  };

  const colorModeConfig: MenuConfigEntryOneOf<ColorMode> = {
    label: 'Color mode',
    icon: PaletteIcon,
    type: 'oneOf',
    value: colorMode,
    options: Object.values(ColorMode),
    onChange: setColorMode,
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

  const scaleSizeConfig: MenuConfigEntryNumber = {
    label: 'Scale size',
    icon: HashIcon,
    type: 'number',
    value: scaleSize,
    disabled: scaleMode !== ScaleMode.Fixed,
    min: 10,
    max: 100,
    step: 10,
    onChange: setScaleSize,
  };

  const debugConfig: MenuConfigEntryBoolean = {
    label: 'Debug',
    icon: BugIcon,
    type: 'boolean',
    value: showDebug,
    labelTrue: 'On',
    labelFalse: 'Off',
    onChange: setShowDebug,
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
          expansionPhasesConfig,
          speedConfig,
          annotationsConfig,
          colorModeConfig,
          autoRotateConfig,
          scaleModeConfig,
          scaleSizeConfig,
          debugConfig,
        ]}
        visible={showSettings}
      />
    </Box>
  );
}
