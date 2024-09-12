import { ProjectWindow, ProjectTabs, ProjectTab } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BookOpenIcon, ChartNoAxesCombinedIcon, InfoIcon } from 'lucide-react';
import { Box } from 'preshape';
import ArrangementInformation from './Arrangement/ArrangementInformation';
import ArrangementProvider from './Arrangement/ArrangementProvider';
import ArrangementStats from './ArrangementStats/ArrangementStats';
import Library from './Library/Library';
import NotationInput from './Notation/NotationInput';
import NotationProvider from './Notation/NotationProvider';
import PlayerControls from './Player/PlayerControls';
import PlayerProvider from './Player/PlayerProvider';
import Renderer, { RendererProps } from './Renderer/Renderer';
import Settings from './Settings/Settings';
import SettingsProvider from './Settings/SettingsProvider';
import { useSettingsContext } from './Settings/useSettingsContext';

// const DEFAULT_NOTATION = '4-12,12'; // Overlaps
// const DEFAULT_NOTATION = '12-3/m30/m(h4)';
// const DEFAULT_NOTATION = '3/m30';
// const DEFAULT_NOTATION = '3-4,3-3,3,3/m60/m(c3)';
// const DEFAULT_NOTATION = '3-4,3-3,3-12/m90/r(h12)';
const DEFAULT_NOTATION = '3-4,3-3,3,12/m90/m(c3)';

function PresentationInner(props: RendererProps) {
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

          <ProjectTab Icon={BookOpenIcon} name="Library">
            <Library />
          </ProjectTab>
        </ProjectTabs>
      }
    >
      <Box flex="vertical" gap="x8" grow>
        <NotationInput />
        <Renderer {...props} minHeight="500px" withPlayer />
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
