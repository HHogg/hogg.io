import { ProjectWindow } from '@hogg/common';
import Controls from './Controls';
import LineSegmentProvider from './LineSegmentProvider';
import Renderer from './Renderer';
import Settings from './Settings';
import WasmApi from './WasmApi/WasmApi';
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
    <WasmApi>
      <LineSegmentProvider>
        <Presentation />
      </LineSegmentProvider>
    </WasmApi>
  );
}

export default PresentationWithContext;
