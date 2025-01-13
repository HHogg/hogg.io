import { ProjectWindow, ProjectTabs, ProjectTab } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import { ChartNoAxesCombinedIcon, InfoIcon } from 'lucide-react';
import { Box } from 'preshape';
import ArrangementInformation from './ArrangementInformation/ArrangementInformation';
import ArrangementStats from './ArrangementStats/ArrangementStats';
import NotationInput from './Notation/NotationInput';
import NotationProvider from './Notation/NotationProvider';
import PlayerControls from './Player/PlayerControls';
import PlayerProvider from './Player/PlayerProvider';
import RendererPlayer from './Renderer/RendererPlayer';
import Settings from './Settings/Settings';
import SettingsProvider from './Settings/SettingsProvider';
import { useSettingsContext } from './Settings/useSettingsContext';

const DEFAULT_NOTATION = '6-3-4,4-3/m90/r(h7)';
// const DEFAULT_NOTATION = '4-3,3/m90/m(h2)';

function PresentationInner() {
  const { setShowSettings } = useSettingsContext();

  return (
    <ProjectWindow
      controls={<PlayerControls />}
      onClick={() => setShowSettings(false)}
      padding="x0"
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
      <Box container flex="vertical" gap="x8" grow>
        <Box absolute="top" padding="x6" zIndex={1}>
          <NotationInput />
        </Box>

        <RendererPlayer minHeight="500px" />
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
          <PlayerProvider>
            <PresentationInner />
          </PlayerProvider>
        </NotationProvider>
      </SettingsProvider>
    </WasmApiLoadingScreen>
  );
}
