import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { TerminalIcon } from 'lucide-react';
import { Box, ButtonAsync, Text, useResizeObserver } from 'preshape';
import { useState } from 'react';
import { useCanvasDimensions } from '../worker/useCanvasDimensions';
import { useCanvasTransfer } from '../worker/useCanvasTransfer';
import { useInitSimulation } from '../worker/useInitSimulation';
import useMessageHandler from '../worker/useMessageHandler';
import { useTerminateWorker } from '../worker/useTerminateWorker';
import ConfigMenu from './ConfigMenu';
import Controls from './Controls';
import LogsPanel from './LogsPanel';

const Presentation = () => {
  const [size, refSize] = useResizeObserver<HTMLDivElement>();
  const { height, width } = size;
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const messageHandler = useMessageHandler();
  const { isInitializing, initSimulation } = useInitSimulation(messageHandler);
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);

  // Initialize worker and shared buffer
  useTerminateWorker(messageHandler);

  // Transfer canvas to render worker when ready
  useCanvasTransfer(canvas, messageHandler);

  // Handle canvas dimension updates
  useCanvasDimensions(width, height, messageHandler);

  return (
    <ProjectWindow
      controls={
        <Controls
          messageHandler={messageHandler}
          isConfigMenuOpen={isConfigMenuOpen}
          setIsConfigMenuOpen={setIsConfigMenuOpen}
        />
      }
      onClick={() => setIsConfigMenuOpen(false)}
      padding="x0"
      tabs={
        <ProjectTabs>
          <ProjectTab name="Logs" Icon={TerminalIcon}>
            <LogsPanel messageHandler={messageHandler} />
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

          {messageHandler.readyToInit && (
            <Box absolute="center" flex="horizontal" alignChildren="middle">
              <ButtonAsync
                color="positive"
                error={messageHandler.lastErrorMessage}
                isError={messageHandler.hasError}
                isLoading={isInitializing}
                isSuccess={messageHandler.isSimulationInit}
                variant="primary"
                onClick={() => initSimulation()}
              >
                Initialize simulation
              </ButtonAsync>
            </Box>
          )}

          {messageHandler.hasError && (
            <Box absolute="center" maxWidth="300px">
              {messageHandler.eventsErrors.map((event, index) => (
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
        messageHandler={messageHandler}
        isConfigMenuOpen={isConfigMenuOpen}
      />
    </ProjectWindow>
  );
};

export default Presentation;
