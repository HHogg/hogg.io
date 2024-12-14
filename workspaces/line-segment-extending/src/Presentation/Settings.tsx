import {
  ArrowLeftFromLineIcon,
  ArrowRightFromLine,
  BoxSelectIcon,
  MinusIcon,
} from 'lucide-react';
import {
  Box,
  ConfigMenu,
  MenuConfigEntryBoolean,
  MenuConfigEntryManyOf,
} from 'preshape';
import { BoundFlag, useLineSegmentContext } from './useLineSegmentContext';

export default function Settings() {
  const {
    extendEnd,
    extendStart,
    showBounds,
    showLineSegment,
    showSettings,
    setExtendStart,
    setExtendEnd,
    setShowBounds,
    setShowLineSegment,
  } = useLineSegmentContext();

  const showBoundsConfig: MenuConfigEntryManyOf<BoundFlag> = {
    label: 'Bounds',
    icon: BoxSelectIcon,
    type: 'manyOf',
    value: showBounds,
    onChange: setShowBounds,
    options: [BoundFlag.TOP, BoundFlag.RIGHT, BoundFlag.BOTTOM, BoundFlag.LEFT],
  };

  const showLineSegmentConfig: MenuConfigEntryBoolean = {
    label: 'Line segment',
    icon: MinusIcon,
    type: 'boolean',
    value: showLineSegment,
    onChange: setShowLineSegment,
    labelTrue: 'Yes',
    labelFalse: 'No',
  };

  const showExtendStartConfig: MenuConfigEntryBoolean = {
    label: 'Extend start',
    icon: ArrowLeftFromLineIcon,
    type: 'boolean',
    value: extendStart,
    onChange: setExtendStart,
    labelTrue: 'Yes',
    labelFalse: 'No',
  };

  const showExtendEndConfig: MenuConfigEntryBoolean = {
    label: 'Extend end',
    icon: ArrowRightFromLine,
    type: 'boolean',
    value: extendEnd,
    onChange: setExtendEnd,
    labelTrue: 'Yes',
    labelFalse: 'No',
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
          showBoundsConfig,
          showLineSegmentConfig,
          showExtendStartConfig,
          showExtendEndConfig,
        ]}
        visible={showSettings}
      />
    </Box>
  );
}
