import {
  ProjectControls,
  ProjectControlGroup,
  ProjectControl,
} from '@hogg/common';
import { SettingsIcon } from 'lucide-react';
import { PointerEvent } from 'react';
import { useLineSegmentContext } from './useLineSegmentContext';

export default function Controls() {
  const { showSettings, setShowSettings } = useLineSegmentContext();

  const handleToggleConfigMenu = (event: PointerEvent) => {
    event.stopPropagation();
    setShowSettings(!showSettings);
  };

  return (
    <ProjectControls alignChildrenHorizontal="between">
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
