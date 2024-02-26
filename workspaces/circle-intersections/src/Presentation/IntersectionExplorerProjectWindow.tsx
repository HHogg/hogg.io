import { ProjectTab, ProjectTabs, ProjectWindow } from '@hogg/common';
import { GitCommitVerticalIcon, RouteIcon } from 'lucide-react';
import { useMatchMedia } from 'preshape';
import GraphRenderer from './GraphRenderer/GraphRenderer';
import IntersectionExplorerConfigMenu from './IntersectionExplorerConfigMenu';
import IntersectionExplorerControls from './IntersectionExplorerControls';
import NodePanel from './NodePanel/NodePanel';
import TraversalList from './TraversalList/TraversalList';
import useIntersectionExplorerContext from './useIntersectionExplorerContext';

const IntersectionExplorerProjectWindow = () => {
  const { setIsConfigMenuOpen } = useIntersectionExplorerContext();
  const match = useMatchMedia(['600px']);
  const isLarge = match('600px');

  return (
    <ProjectWindow
      tabsRevealPercentage={0.5}
      controls={isLarge ? <IntersectionExplorerControls /> : undefined}
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
