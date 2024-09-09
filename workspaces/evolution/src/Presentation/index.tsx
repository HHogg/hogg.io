import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { GalleryVerticalIcon } from 'lucide-react';

const Presentation = ({}: {}) => {
  return (
    <ProjectWindow
      controls={<div />}
      controlsPosition="top"
      padding="x0"
      tabs={
        <ProjectTabs>
          <ProjectTab name="Gallery" Icon={GalleryVerticalIcon}></ProjectTab>
        </ProjectTabs>
      }
    ></ProjectWindow>
  );
};

export default Presentation;
