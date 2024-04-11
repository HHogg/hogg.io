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
import { Box, useMatchMedia } from 'preshape';
import { useSettingsContext } from '../Settings/useSettingsContext';
import PlayerControlBar from './PlayerControlBar';
import { usePlayerContext } from './usePlayerContext';

export default function PlayerControls() {
  const { fullScreenEnter, fullScreenExit, isFullScreen } =
    useProjectWindowContext();
  const { toggleSettings } = useSettingsContext();
  const { play, pause, forward, backward, toStart, toEnd, isPlaying } =
    usePlayerContext();

  const match = useMatchMedia(['600px']);
  const isLarge = match('600px');

  const handleSettingsClick = (event: React.PointerEvent) => {
    event.stopPropagation();
    toggleSettings();
  };

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
          {isLarge && (
            <ProjectControl
              title="Beginning"
              Icon={ChevronFirstIcon}
              onClick={toStart}
            />
          )}

          <ProjectControl
            title="Step backwards"
            Icon={ChevronLeftIcon}
            onClick={backward}
          />
        </ProjectControlGroup>

        {isLarge && (
          <Box grow>
            <PlayerControlBar />
          </Box>
        )}

        <ProjectControlGroup>
          <ProjectControl
            title="Step forwards"
            Icon={ChevronRightIcon}
            onClick={forward}
          />

          {isLarge && (
            <ProjectControl
              title="End"
              Icon={ChevronLastIcon}
              onClick={toEnd}
            />
          )}
        </ProjectControlGroup>
      </Box>

      <ProjectControlGroup>
        {isLarge && !isFullScreen && (
          <ProjectControl
            title="Enter fullscreen"
            Icon={MaximizeIcon}
            onClick={fullScreenEnter}
          />
        )}

        {isLarge && isFullScreen && (
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
