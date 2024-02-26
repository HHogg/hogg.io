import { ProjectPage, ProjectPageProps } from '@hogg/common';
import Bitset from 'bitset';
import { useRef, useState } from 'react';
import Article from './Article';
import IntersectionExplorer from './Presentation/IntersectionExplorer';
import useGraph, { Circle, Traversal } from './useGraph';

export type TraversalJSON = {
  bitset: string;
  path: number[];
};

const sampleCircles: Circle[] = [
  { id: 'c', radius: 0.25, x: 0, y: 0 },

  { id: 'tl-big', radius: 0.25, x: -0.2, y: -0.2 },
  { id: 'bl-big', radius: 0.25, x: -0.2, y: +0.2 },
  { id: 'tr-big', radius: 0.25, x: +0.2, y: -0.2 },
  { id: 'br-big', radius: 0.25, x: +0.2, y: +0.2 },

  { id: 'tl-small', radius: 0.15, x: -0.35, y: -0.35 },
  { id: 'bl-small', radius: 0.15, x: -0.35, y: +0.35 },
  { id: 'tr-small', radius: 0.15, x: +0.35, y: -0.35 },
  { id: 'br-small', radius: 0.15, x: +0.35, y: +0.35 },
];

const parseTraversal = (traversals: TraversalJSON[]): Traversal[] => {
  return traversals.map(({ bitset, path }, index) => ({
    bitset: Bitset.fromBinaryString(bitset),
    index: index,
    isComplete: path.length > 2 && path[0] === path[path.length - 1],
    path: path,
  }));
};

export default function Project(props: ProjectPageProps) {
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
    <ProjectPage
      {...props}
      article={<Article onRuleSelect={handleSetTraversals} />}
      presentation={
        <IntersectionExplorer
          {...resultUseGraphHook}
          activeNodeIndex={activeNodeIndex}
        />
      }
    />
  );
}
