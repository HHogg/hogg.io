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

const DEFAULT_NOTATION = '3-3-6-3-3,3/r60/r(h16)';

function PresentationInner() {
  const { setShowSettings } = useSettingsContext();

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
