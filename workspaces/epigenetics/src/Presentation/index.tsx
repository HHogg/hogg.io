import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { ChartScatterIcon, TerminalIcon } from 'lucide-react';
import { Box, Label, Labels, Text, useResizeObserver } from 'preshape';
import { useState } from 'react';
import { useCanvasTransfer } from '../worker/useCanvasTransfer';
import useSimulationWorker from '../worker/useSimulationWorker';
import CellGrid from './CellGrid';
import ConfigMenu from './ConfigMenu';
import Controls from './Controls';
import LogsPanel from './LogsPanel';

const Presentation = () => {
  const [canvasSize, refSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = canvasSize;
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const simulationWorker = useSimulationWorker(width, height);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);

  // Transfer canvas to render worker when ready
  useCanvasTransfer(canvas, simulationWorker);

  return (
    <ProjectWindow
      controls={
        <Controls
          simulationWorker={simulationWorker}
          isConfigMenuOpen={isConfigMenuOpen}
          setIsConfigMenuOpen={setIsConfigMenuOpen}
        />
      }
      onClick={() => setIsConfigMenuOpen(false)}
      padding="x0"
      tabs={
        <ProjectTabs>
          <ProjectTab name="Stats" Icon={ChartScatterIcon}>
            <LogsPanel messageHandler={simulationWorker} />
          </ProjectTab>

          <ProjectTab name="Logs" Icon={TerminalIcon}>
            <LogsPanel messageHandler={simulationWorker} />
          </ProjectTab>
        </ProjectTabs>
      }
    >
      <Box flex="vertical" grow ref={refSize}>
        <Box basis="0" container grow>
          {!!(height && width) && (
            <Box
              ref={setCanvas}
              absolute="edge-to-edge"
              height={height}
              width={width}
              tag="canvas"
            />
          )}

          {simulationWorker.runStats && (
            <Box absolute="top-right" padding="x6">
              <Labels>
                <Label>
                  {simulationWorker.runStats.passesPerSecond.toFixed(2)}/fps
                </Label>
              </Labels>
            </Box>
          )}

          {simulationWorker.isInitialized && (
            <CellGrid
              width={width}
              height={height}
              simulationWorker={simulationWorker}
            />
          )}

          {simulationWorker.hasError && (
            <Box absolute="center" maxWidth="300px">
              {simulationWorker.eventsErrors.map((event, index) => (
                <Text
                  key={index}
                  align="middle"
                  padding="x3"
                  textColor="negative-shade-4"
                  weight="x2"
                >
                  {event.message}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <ConfigMenu
        simulationWorker={simulationWorker}
        isConfigMenuOpen={isConfigMenuOpen}
      />
    </ProjectWindow>
  );
};

export default Presentation;
