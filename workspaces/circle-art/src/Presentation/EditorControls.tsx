import {
  ProjectControl,
  ProjectControlGroup,
  ProjectControls,
} from '@hogg/common';
import {
  DownloadIcon,
  DropletIcon,
  EyeIcon,
  FileIcon,
  PencilIcon,
} from 'lucide-react';
import useEditorContext from './useEditorContext';

const EditorControls = () => {
  const { mode, clearCanvas, openDownloadMenu, setMode } = useEditorContext();

  return (
    <ProjectControls>
      <ProjectControlGroup>
        <ProjectControl Icon={FileIcon} title="New" onClick={clearCanvas} />
      </ProjectControlGroup>

      <ProjectControlGroup joined>
        <ProjectControl
          Icon={PencilIcon}
          title="Draw"
          onClick={() => setMode('draw')}
          variant="primary"
          active={mode === 'draw'}
        />

        <ProjectControl
          Icon={DropletIcon}
          title="Fill"
          onClick={() => setMode('fill')}
          variant="primary"
          active={mode === 'fill'}
        />

        <ProjectControl
          Icon={EyeIcon}
          title="View"
          onClick={() => setMode('view')}
          variant="primary"
          active={mode === 'view'}
        />
      </ProjectControlGroup>

      <ProjectControlGroup>
        <ProjectControl
          Icon={DownloadIcon}
          title="Download"
          onClick={openDownloadMenu}
        />
      </ProjectControlGroup>
    </ProjectControls>
  );
};

export default EditorControls;
