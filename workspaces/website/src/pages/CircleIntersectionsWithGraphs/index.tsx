import {
  IntersectionExplorer,
  Traversal,
  Circle,
  useGraph,
} from '@hogg/circles';
import Bitset from 'bitset';
import { useRef, useState } from 'react';
import ProjectPage from '../../components/ProjectPage/ProjectPage';
import ProjectPageProvider from '../../components/ProjectPage/ProjectPageProvider';
import { ProjectKey } from '../../types';
import Article from './Article';

export type TraversalJSON = {
  bitset: string;
  path: number[];
};

const sampleCircles: Circle[] = [
  { radius: 0.25, x: 0, y: 0 },

  { radius: 0.25, x: -0.2, y: -0.2 },
  { radius: 0.25, x: -0.2, y: +0.2 },
  { radius: 0.25, x: +0.2, y: -0.2 },
  { radius: 0.25, x: +0.2, y: +0.2 },

  { radius: 0.15, x: -0.35, y: -0.35 },
  { radius: 0.15, x: -0.35, y: +0.35 },
  { radius: 0.15, x: +0.35, y: -0.35 },
  { radius: 0.15, x: +0.35, y: +0.35 },
];

const parseTraversal = (traversals: TraversalJSON[]): Traversal[] => {
  return traversals.map(({ bitset, path }, index) => ({
    bitset: Bitset.fromBinaryString(bitset),
    index: index,
    isComplete: path.length > 2 && path[0] === path[path.length - 1],
    path: path,
  }));
};

export default function CircleIntersectionsWithGraphs() {
  const refVisualisation = useRef<HTMLDivElement>(null);
  const [{ activeNodeIndex, traversals }, setGraphProps] = useState<{
    activeNodeIndex: undefined | number;
    traversals: Traversal[];
  }>({
    activeNodeIndex: undefined,
    traversals: [],
  });

  const resultUseGraphHook = useGraph(sampleCircles, { traversals });

  const handleSetTraversals = (
    activeNodeIndex: number,
    traversals: TraversalJSON[]
  ) => {
    setGraphProps({
      activeNodeIndex: activeNodeIndex,
      traversals: parseTraversal(traversals),
    });

    refVisualisation.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <ProjectPageProvider id={ProjectKey.CircleIntersectionsWithGraphs}>
      <ProjectPage
        article={<Article onRuleSelect={handleSetTraversals} />}
        presentation={
          <IntersectionExplorer
            {...resultUseGraphHook}
            activeNodeIndex={activeNodeIndex}
          />
        }
      />
    </ProjectPageProvider>
  );
}
