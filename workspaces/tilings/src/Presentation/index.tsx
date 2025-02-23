import { ProjectWindow, ProjectTabs, ProjectTab } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import { BookOpenIcon, ChartNoAxesCombinedIcon, InfoIcon } from 'lucide-react';
import { Box } from 'preshape';
import { useCallback, useState } from 'react';
import ArrangementInformation from './ArrangementInformation/ArrangementInformation';
import ArrangementStats from './ArrangementStats/ArrangementStats';
import Library from './Library/Library';
import NotationInput from './Notation/NotationInput';
import NotationProvider from './Notation/NotationProvider';
import PlayerControls from './Player/PlayerControls';
import PlayerProvider from './Player/PlayerProvider';
import RendererPlayer from './Renderer/RendererPlayer';
import Settings from './Settings/Settings';
import SettingsProvider from './Settings/SettingsProvider';
import { useSettingsContext } from './Settings/useSettingsContext';
import { getRandomNotation } from './utils/results';

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

          <ProjectTab Icon={BookOpenIcon} name="Library">
            <Library />
          </ProjectTab>
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
  const [defaultNotation, setDefaultNotation] = useState(getRandomNotation());

  const refreshNotation = useCallback(() => {
    setDefaultNotation(getRandomNotation);
  }, []);

  return (
    <WasmApiLoadingScreen>
      <SettingsProvider>
        <PlayerProvider onEnd={refreshNotation}>
          <NotationProvider notation={defaultNotation}>
            <PresentationInner />
          </NotationProvider>
        </PlayerProvider>
      </SettingsProvider>
    </WasmApiLoadingScreen>
  );
}
