import { ProjectWindow } from '@hogg/common';
import Controls from './Controls';
import Renderer from './Renderer';
import Settings from './Settings';
import { useLineSegmentContext } from './useLineSegmentContext';

type Props = {};

export default function Presentation({}: Props) {
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
