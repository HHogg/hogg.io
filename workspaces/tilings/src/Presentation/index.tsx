import { ProjectWindow, ProjectTabs, ProjectTab } from '@hogg/common';
import { BookOpenIcon } from 'lucide-react';
import { Box } from 'preshape';
import ArrangementProvider from './Arrangement/ArrangementProvider';
import Library from './Library/Library';
import NotationInput from './Notation/NotationInput';
import NotationProvider from './Notation/NotationProvider';
import PlayerControls from './Player/PlayerControls';
import PlayerProvider from './Player/PlayerProvider';
import Renderer, { RendererProps } from './Renderer/Renderer';
import Settings from './Settings/Settings';
import SettingsProvider from './Settings/SettingsProvider';
import { useSettingsContext } from './Settings/useSettingsContext';
import WasmApi from './WasmApi/WasmApi';

function PresentationInner(props: RendererProps) {
  const { setShowSettings } = useSettingsContext();

  return (
    <ProjectWindow
      controls={<PlayerControls />}
      onClick={() => setShowSettings(false)}
      tabs={
        <ProjectTabs>
          <ProjectTab Icon={BookOpenIcon} name="Library">
            <Library />
          </ProjectTab>
        </ProjectTabs>
      }
    >
      <Box flex="vertical" gap="x8" grow>
        <NotationInput />
        <Renderer {...props} />
      </Box>

      <Settings />
    </ProjectWindow>
  );
}

export default function Presentation({}) {
  return (
    <WasmApi>
      <SettingsProvider>
        <NotationProvider notation="3/m30/m(h2)">
          <ArrangementProvider>
            <PlayerProvider>
              <PresentationInner />
            </PlayerProvider>
          </ArrangementProvider>
        </NotationProvider>
      </SettingsProvider>
    </WasmApi>
  );
}
