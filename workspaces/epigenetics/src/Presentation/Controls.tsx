import {
  ProjectControls,
  ProjectControlGroup,
  ProjectControl,
} from '@hogg/common';
import { PauseIcon, PlayIcon, SettingsIcon } from 'lucide-react';
import { PointerEvent, useCallback } from 'react';
import { getSimulationWorker } from '../worker/simulationWorker';
import { UseMessageHandlerResult } from '../worker/useMessageHandler';

interface ControlsProps {
  messageHandler: UseMessageHandlerResult;
  isConfigMenuOpen: boolean;
  setIsConfigMenuOpen: (isOpen: boolean) => void;
}

export default function Controls({
  messageHandler,
  isConfigMenuOpen,
  setIsConfigMenuOpen,
}: ControlsProps) {
  const { isSimulationInit, isSimulationLoopRunning } = messageHandler;

  const handlePlay = useCallback(async () => {
    try {
      const simulationWorker = getSimulationWorker(
        messageHandler.onError,
        messageHandler.onMessage
      );
      await simulationWorker.startSimulationLoop();
    } catch (error) {
      messageHandler.onError(error as string);
    }
  }, [messageHandler]);

  const handlePause = useCallback(async () => {
    try {
      const simulationWorker = getSimulationWorker(
        messageHandler.onError,
        messageHandler.onMessage
      );
      await simulationWorker.stopSimulationLoop();
    } catch (error) {
      messageHandler.onError(error as string);
    }
  }, [messageHandler]);

  const handleToggleConfigMenu = useCallback(
    (event: PointerEvent) => {
      event.stopPropagation();
      setIsConfigMenuOpen(!isConfigMenuOpen);
    },
    [isConfigMenuOpen, setIsConfigMenuOpen]
  );

  const isPlayDisabled = !isSimulationInit || isSimulationLoopRunning;

  return (
    <ProjectControls>
      <ProjectControlGroup>
        {isSimulationLoopRunning ? (
          <ProjectControl
            Icon={PauseIcon}
            title="Pause"
            onClick={handlePause}
          />
        ) : (
          <ProjectControl
            Icon={PlayIcon}
            title="Play"
            onClick={handlePlay}
            disabled={isPlayDisabled}
          />
        )}
      </ProjectControlGroup>

      <ProjectControlGroup>
        <ProjectControl
          Icon={SettingsIcon}
          title="Settings"
          onClick={handleToggleConfigMenu}
        />
      </ProjectControlGroup>
    </ProjectControls>
  );
}
