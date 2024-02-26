import { GaugeIcon } from 'lucide-react';
import { Box, ConfigMenu, MenuConfigEntryNumber } from 'preshape';
import useIntersectionExplorerContext from './useIntersectionExplorerContext';

export default function IntersectionExplorerConfigMenu() {
  const { isConfigMenuOpen, speed, setSpeed } =
    useIntersectionExplorerContext();

  const speedConfig: MenuConfigEntryNumber = {
    label: 'Speed',
    icon: GaugeIcon,
    type: 'number',
    value: speed,
    min: 1,
    max: 10,
    step: 1,
    formatter: (value) => `${value}x`,
    onChange: setSpeed,
  };

  return (
    <Box
      absolute="bottom-right"
      padding="x6"
      onClick={(e) => e.stopPropagation()}
      style={{ pointerEvents: isConfigMenuOpen ? undefined : 'none' }}
      zIndex={10}
    >
      <ConfigMenu config={[speedConfig]} visible={isConfigMenuOpen} />
    </Box>
  );
}
