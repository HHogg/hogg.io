import {
  ProjectControl,
  ProjectControlGroup,
  ProjectControls,
} from '@hogg/common';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  PauseIcon,
  PlayIcon,
  SettingsIcon,
} from 'lucide-react';
import { Box, useMatchMedia } from 'preshape';
import ArrangementControlBar from './PlayerControlBar';
import { usePlayerContext } from './usePlayerContext';

export default function PlayerControls() {
  const {
    play,
    pause,
    forward,
    backward,
    toStart,
    toEnd,
    toggleSettings,
    isPlaying,
  } = usePlayerContext();

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
              Icon={ChevronFirst}
              onClick={toStart}
            />
          )}

          <ProjectControl
            title="Step backwards"
            Icon={ChevronLeft}
            onClick={backward}
          />
        </ProjectControlGroup>

        {isLarge && (
          <Box grow>
            <ArrangementControlBar />
          </Box>
        )}

        <ProjectControlGroup>
          <ProjectControl
            title="Step forwards"
            Icon={ChevronRight}
            onClick={forward}
            variant="tertiary"
          />

          {isLarge && (
            <ProjectControl
              title="End"
              Icon={ChevronLast}
              onClick={toEnd}
              variant="tertiary"
            />
          )}
        </ProjectControlGroup>
      </Box>

      <ProjectControlGroup>
        <ProjectControl
          title="Settings"
          Icon={SettingsIcon}
          onClick={handleSettingsClick}
          variant="tertiary"
        />
      </ProjectControlGroup>
    </ProjectControls>
  );
}
