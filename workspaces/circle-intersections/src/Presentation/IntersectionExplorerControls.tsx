import {
  ProjectControls,
  ProjectControlGroup,
  ProjectControl,
  ProjectProgressBar,
} from '@hogg/common';
import {
  PauseIcon,
  PlayIcon,
  ChevronLeft,
  ChevronRight,
  RotateCcwIcon,
  XIcon,
  SettingsIcon,
} from 'lucide-react';
import { Box } from 'preshape';
import { useEffect, useState, PointerEvent } from 'react';
import { getGraphEdgeTransitionDurationMs } from './GraphRenderer/getGraphEdgeTransitionDurationMs';
import useIntersectionExplorerContext from './useIntersectionExplorerContext';

export default function IntersectionExplorerControls() {
  const {
    currentTraversal,
    isConfigMenuOpen,
    cancelTraversal,
    clearTraversals,
    connectNextNode,
    disconnectPreviousNode,
    setIsConfigMenuOpen,
    graph,
    speed,
  } = useIntersectionExplorerContext();
  const [isRunning, setIsRunning] = useState(false);
  const elapsed =
    graph.traversals.filter(({ isComplete }) => isComplete).length / 25;

  const handlePlay = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleNext = () => {
    setIsRunning(false);
    connectNextNode();
  };

  const handlePrevious = () => {
    setIsRunning(false);
    disconnectPreviousNode();
  };

  const handleToggleConfigMenu = (event: PointerEvent) => {
    event.stopPropagation();
    setIsConfigMenuOpen(!isConfigMenuOpen);
  };

  useEffect(() => {
    if (isRunning) {
      const selectableNodes = [...graph.nodes, ...graph.edges].filter(
        ({ state }) => state.isSelectable
      );

      if (selectableNodes.length > 0) {
        const interval = setTimeout(() => {
          connectNextNode();
        }, getGraphEdgeTransitionDurationMs(speed));

        return () => clearInterval(interval);
      }
    }
  }, [connectNextNode, graph, speed, isRunning]);

  return (
    <ProjectControls>
      <ProjectControlGroup>
        {isRunning ? (
          <ProjectControl
            Icon={PauseIcon}
            title="Pause"
            onClick={handlePause}
          />
        ) : (
          <ProjectControl Icon={PlayIcon} title="Play" onClick={handlePlay} />
        )}
      </ProjectControlGroup>

      <Box alignChildren="middle" flex="horizontal" gap="x6" grow>
        <ProjectControlGroup>
          <ProjectControl
            Icon={ChevronLeft}
            title="Previous"
            onClick={handlePrevious}
          />
        </ProjectControlGroup>

        <Box grow>
          <ProjectProgressBar elapsed={elapsed} />
        </Box>

        <ProjectControlGroup>
          <ProjectControl
            Icon={ChevronRight}
            title="Next"
            onClick={handleNext}
          />
        </ProjectControlGroup>
      </Box>

      <ProjectControlGroup>
        {currentTraversal ? (
          <ProjectControl
            Icon={XIcon}
            title="Cancel traversal"
            onClick={cancelTraversal}
          />
        ) : (
          <ProjectControl
            Icon={RotateCcwIcon}
            title="Reset"
            onClick={clearTraversals}
          />
        )}

        <ProjectControl
          Icon={SettingsIcon}
          title="Settings"
          onClick={handleToggleConfigMenu}
        />
      </ProjectControlGroup>
    </ProjectControls>
  );
}
