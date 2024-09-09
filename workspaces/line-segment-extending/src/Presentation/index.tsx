import { ProjectWindow } from '@hogg/common';
import { WasmApiLoadingScreen } from '@hogg/wasm';
import Controls from './Controls';
import LineSegmentProvider from './LineSegmentProvider';
import Renderer from './Renderer';
import Settings from './Settings';
import { useLineSegmentContext } from './useLineSegmentContext';

type Props = {};

function Presentation({}: Props) {
  const { setShowSettings } = useLineSegmentContext();

  return (
    <ProjectWindow
      backgroundPattern="grid"
      controls={<Controls />}
      onClick={() => setShowSettings(false)}
    >
      <Renderer />
      <Settings />
    </ProjectWindow>
  );
}

function PresentationWithContext() {
  return (
    <WasmApiLoadingScreen>
      <LineSegmentProvider>
        <Presentation />
      </LineSegmentProvider>
    </WasmApiLoadingScreen>
  );
}

export default PresentationWithContext;
