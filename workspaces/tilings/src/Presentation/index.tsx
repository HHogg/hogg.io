import { ProjectWindow, ProjectTabs, ProjectTab } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import { ChartNoAxesCombinedIcon, InfoIcon } from 'lucide-react';
import { Box } from 'preshape';
import { useMemo } from 'react';
import ArrangementProvider from './Arrangement/ArrangementProvider';
import ArrangementInformation from './ArrangementInformation/ArrangementInformation';
import ArrangementStats from './ArrangementStats/ArrangementStats';
import NotationInput from './Notation/NotationInput';
import NotationProvider from './Notation/NotationProvider';
import PlayerControls from './Player/PlayerControls';
import PlayerProvider from './Player/PlayerProvider';
import { usePlayerContext } from './Player/usePlayerContext';
import Renderer, { RendererProps } from './Renderer/Renderer';
import Settings from './Settings/Settings';
import SettingsProvider from './Settings/SettingsProvider';
import { useSettingsContext } from './Settings/useSettingsContext';

// const DEFAULT_NOTATION = '3-4,3-3,4-6/r60/r(c5)';
// const DEFAULT_NOTATION = '3-4,3-3,3,3/r60/r(h3)';

const DEFAULT_NOTATION = '6/r60/r(h6)';

function PresentationInner(props: RendererProps) {
  const {
    setShowSettings,
    autoRotate,
    expansionPhases,
    colorMode,
    colorPalette,
    scaleMode,
    showLayers,
  } = useSettingsContext();
  const { maxStage } = usePlayerContext();

  const options = useMemo(
    () => ({
      autoRotate,
      colorMode,
      colorPalette,
      maxStage,
      scaleMode,
      showLayers,
    }),
    [autoRotate, colorMode, colorPalette, maxStage, scaleMode, showLayers]
  );

  return (
    <ProjectWindow
      controls={<PlayerControls />}
      onClick={() => setShowSettings(false)}
      tabs={
        <ProjectTabs>
          <ProjectTab Icon={InfoIcon} name="Info">
            <ArrangementInformation />
          </ProjectTab>

          <ProjectTab Icon={ChartNoAxesCombinedIcon} name="Stats">
            <ArrangementStats />
          </ProjectTab>

          {/* <ProjectTab Icon={BookOpenIcon} name="Library">
            <Library />
          </ProjectTab> */}
        </ProjectTabs>
      }
    >
      <Box flex="vertical" gap="x8" grow>
        <NotationInput />
        <Renderer
          {...props}
          expansionPhases={expansionPhases}
          minHeight="500px"
          options={options}
        />
      </Box>

      <Settings />
    </ProjectWindow>
  );
}

export default function Presentation({}) {
  return (
    <WasmApiLoadingScreen>
      <SettingsProvider>
        <NotationProvider notation={DEFAULT_NOTATION}>
          <ArrangementProvider>
            <PlayerProvider>
              <PresentationInner />
            </PlayerProvider>
          </ArrangementProvider>
        </NotationProvider>
      </SettingsProvider>
    </WasmApiLoadingScreen>
  );
}
