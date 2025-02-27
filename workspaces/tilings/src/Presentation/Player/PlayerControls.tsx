import {
  ProjectControl,
  ProjectControlGroup,
  ProjectControls,
  useProjectWindowContext,
} from '@hogg/common';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from 'lucide-react';
import { Box } from 'preshape';
import { useSettingsContext } from '../Settings/useSettingsContext';
import PlayerControlBar from './PlayerControlBar';
import { usePlayerContext } from './usePlayerContext';

export default function PlayerControls() {
  const { fullScreenEnter, fullScreenExit, isFullScreen } =
    useProjectWindowContext();
  const { toggleSettings } = useSettingsContext();
  const { play, pause, forward, backward, toStart, toEnd, snapshot } =
    usePlayerContext();

  const handleSettingsClick = (event: React.PointerEvent) => {
    event.stopPropagation();
    toggleSettings();
  };

  const { isPlaying } = snapshot;

  return (
    <ProjectControls>
      <ProjectControlGroup>
        {isPlaying ? (
          <ProjectControl
            title="Pause"
            Icon={PauseIcon}
            disabled={!isPlaying}
            onClick={pause}
          />
        ) : (
          <ProjectControl
            title="Play"
            Icon={PlayIcon}
            disabled={isPlaying}
            onClick={play}
          />
        )}
      </ProjectControlGroup>

      <Box alignChildren="middle" flex="horizontal" gap="x6" grow>
        <ProjectControlGroup>
          <ProjectControl
            title="Beginning"
            Icon={ChevronFirstIcon}
            onClick={toStart}
          />

          <ProjectControl
            title="Step backwards"
            Icon={ChevronLeftIcon}
            onClick={backward}
          />
        </ProjectControlGroup>

        <PlayerControlBar />

        <ProjectControlGroup>
          <ProjectControl
            title="Step forwards"
            Icon={ChevronRightIcon}
            onClick={forward}
          />

          <ProjectControl title="End" Icon={ChevronLastIcon} onClick={toEnd} />
        </ProjectControlGroup>
      </Box>

      <ProjectControlGroup>
        {!isFullScreen && (
          <ProjectControl
            title="Enter fullscreen"
            Icon={MaximizeIcon}
            onClick={fullScreenEnter}
          />
        )}

        {isFullScreen && (
          <ProjectControl
            title="Exit fullscreen"
            Icon={MinimizeIcon}
            onClick={fullScreenExit}
          />
        )}

        <ProjectControl
          title="Settings"
          Icon={SettingsIcon}
          onClick={handleSettingsClick}
        />
      </ProjectControlGroup>
    </ProjectControls>
  );
}
