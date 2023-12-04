import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { BookOpenIcon } from 'lucide-react';
import { Box } from 'preshape';
import Library from '../Library/Library';
import NotationInput from '../Notation/NotationInput';
import Renderer from '../Renderer/Renderer';
import { RendererProps } from '../Renderer/RendererContent';
import ArrangementControls from './PlayerControls';
import PlayerSettings from './PlayerSettings';
import { usePlayerContext } from './usePlayerContext';

export default function PlayerInner(props: RendererProps) {
  const { setShowSettings } = usePlayerContext();

  return (
    <ProjectWindow
      controls={<ArrangementControls />}
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

      <PlayerSettings />
    </ProjectWindow>
  );
}
