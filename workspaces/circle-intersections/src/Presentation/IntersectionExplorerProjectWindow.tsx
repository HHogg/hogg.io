import { Media, ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { GitCommitVerticalIcon, RouteIcon } from 'lucide-react';
import GraphRenderer from './GraphRenderer/GraphRenderer';
import IntersectionExplorerConfigMenu from './IntersectionExplorerConfigMenu';
import IntersectionExplorerControls from './IntersectionExplorerControls';
import NodePanel from './NodePanel/NodePanel';
import TraversalList from './TraversalList/TraversalList';
import useIntersectionExplorerContext from './useIntersectionExplorerContext';

const IntersectionExplorerProjectWindow = () => {
  const { setIsConfigMenuOpen } = useIntersectionExplorerContext();

  return (
    <ProjectWindow
      controls={
        <Media greaterThanOrEqual="desktop">
          <IntersectionExplorerControls />
        </Media>
      }
      onClick={() => setIsConfigMenuOpen(false)}
      tabs={
        <ProjectTabs>
          <ProjectTab name="Nodes" Icon={GitCommitVerticalIcon}>
            <NodePanel />
          </ProjectTab>

          <ProjectTab name="Traversals" Icon={RouteIcon}>
            <TraversalList />
          </ProjectTab>
        </ProjectTabs>
      }
    >
      <GraphRenderer maxWidth="600px" />
      <IntersectionExplorerConfigMenu />
    </ProjectWindow>
  );
};

export default IntersectionExplorerProjectWindow;
