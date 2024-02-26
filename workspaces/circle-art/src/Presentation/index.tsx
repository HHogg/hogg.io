import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { GalleryVerticalIcon } from 'lucide-react';
import EditorCanvas from './EditorCanvas';
import EditorControls from './EditorControls';
import EditorDownloadMenu from './EditorDownloadMenu';
import EditorGallery, { EditorGalleryProps } from './EditorGallery';
import EditorHistoryControls from './EditorHistoryControls';
import EditorProvider, { EditorProviderProps } from './EditorProvider';

const Presentation = ({
  data,
  onSelect,
  onChange,
}: EditorGalleryProps & EditorProviderProps) => {
  return (
    <EditorProvider data={data} onChange={onChange}>
      <ProjectWindow
        controls={<EditorControls />}
        controlsPosition="top"
        padding="x0"
        tabsRevealPercentage={0.5}
        tabs={
          <ProjectTabs>
            <ProjectTab name="Gallery" Icon={GalleryVerticalIcon}>
              <EditorGallery onSelect={onSelect} />
            </ProjectTab>
          </ProjectTabs>
        }
      >
        <EditorCanvas />
        <EditorDownloadMenu />
        <EditorHistoryControls />
      </ProjectWindow>
    </EditorProvider>
  );
};

export default Presentation;
