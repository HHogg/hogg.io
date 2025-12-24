import {
  ProjectControls,
  ProjectControlGroup,
  ProjectControl,
} from '@hogg/common';
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SettingsIcon,
  SquareIcon,
  StepForwardIcon,
} from 'lucide-react';
import { ButtonAsync } from 'preshape';
import { PointerEvent, useCallback } from 'react';
import { UseSimulationWorkerResult } from '../worker/useSimulationWorker';

interface ControlsProps {
  simulationWorker: UseSimulationWorkerResult;
  isConfigMenuOpen: boolean;
  setIsConfigMenuOpen: (isOpen: boolean) => void;
}

export default function Controls({
  simulationWorker,
  isConfigMenuOpen,
  setIsConfigMenuOpen,
}: ControlsProps) {
  const {
    getSimulationWorker,
    initSimulation,
    isCanvasTransferred,
    isWasmReady,
    isInitializing,
    isInitialized,
    isLoopRunning,
    isPaused,
    hasError,
    lastErrorMessage,
    estimatedMemoryUsage,
  } = simulationWorker;

  const handlePlay = useCallback(async () => {
    const simulationWorker = getSimulationWorker();

    // If paused and running, resume. Otherwise, start the loop.
    if (isPaused && isLoopRunning) {
      await simulationWorker.resumeSimulation();
    } else {
      await simulationWorker.startSimulationLoop();
    }
  }, [getSimulationWorker, isPaused, isLoopRunning]);

  const handlePause = useCallback(async () => {
    const simulationWorker = getSimulationWorker();
    await simulationWorker.pauseSimulation();
  }, [getSimulationWorker]);

  const handleStop = useCallback(async () => {
    const simulationWorker = getSimulationWorker();
    await simulationWorker.stopSimulationLoop();
  }, [getSimulationWorker]);

  const handleReset = useCallback(async () => {
    const simulationWorker = getSimulationWorker();
    await simulationWorker.resetSimulation();
  }, [getSimulationWorker]);

  const handleStepFrame = useCallback(async () => {
    const simulationWorker = getSimulationWorker();
    await simulationWorker.stepSimulationFrame();
  }, [getSimulationWorker]);

  const handleToggleConfigMenu = useCallback(
    (event: PointerEvent) => {
      event.stopPropagation();
      setIsConfigMenuOpen(!isConfigMenuOpen);
    },
    [isConfigMenuOpen, setIsConfigMenuOpen]
  );

  // Play is disabled if worker not ready, not initialized, or if running and not paused
  // If paused, play should be enabled to resume
  const isInitializeDisabled =
    !isWasmReady || !isCanvasTransferred || isInitializing || hasError;
  const isPlayDisabled =
    (!isInitializing && !isInitialized) || (isLoopRunning && !isPaused);
  const isPauseDisabled =
    (!isInitializing && !isInitialized) || !isLoopRunning || isPaused;
  const isStopDisabled = (!isInitializing && !isInitialized) || !isLoopRunning;
  const isStepFrameDisabled = !isInitializing && !isInitialized;
  const isResetDisabled = !isInitializing && !isInitialized;

  if (!isInitialized) {
    return (
      <ProjectControls>
        <ProjectControlGroup>
          <ButtonAsync
            color="positive"
            disabled={isInitializeDisabled}
            error={lastErrorMessage}
            isError={hasError}
            isLoading={isInitializing}
            isSuccess={false}
            variant="primary"
            onClick={initSimulation}
          >
            Initialize ({isInitializeDisabled ? '...' : estimatedMemoryUsage})
          </ButtonAsync>
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

  return (
    <ProjectControls>
      <ProjectControlGroup>
        {isLoopRunning && !isPaused ? (
          <ProjectControl
            Icon={PauseIcon}
            title="Pause"
            onClick={handlePause}
            disabled={isPauseDisabled}
          />
        ) : (
          <ProjectControl
            Icon={PlayIcon}
            title={isPaused ? 'Resume' : 'Play'}
            onClick={handlePlay}
            disabled={isPlayDisabled}
          />
        )}
        <ProjectControl
          Icon={SquareIcon}
          title="Stop"
          onClick={handleStop}
          disabled={isStopDisabled}
        />
        <ProjectControl
          Icon={StepForwardIcon}
          title="Next generation"
          onClick={handleStepFrame}
          disabled={isStepFrameDisabled}
        />
        <ProjectControl
          Icon={RotateCcwIcon}
          title="Reset"
          onClick={handleReset}
          disabled={isResetDisabled}
        />
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
