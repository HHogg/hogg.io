import Bitset from 'bitset';
import {
  Box,
  BlockQuote,
  Code,
  Image,
  Link,
  Text,
  useMatchMedia,
} from 'preshape';
import React, { useRef, useState } from 'react';
import data from '../../../data';
import IntersectionExplorer, {
  sampleCircles,
} from '../../Projects/IntersectionExplorer/IntersectionExplorer';
import useGraph, {
  Traversal,
} from '../../Projects/IntersectionExplorer/useGraph';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';
import RuleBox from './RuleBox';
import {
  traversalConfig1,
  traversalConfig2,
  traversalConfig3,
  traversalConfig4,
} from './traversals.json';

interface TraversalJSON {
  bitset: string;
  path: number[];
}

const parseTraversal = (traversals: TraversalJSON[]): Traversal[] => {
  return traversals.map(({ bitset, path }, index) => ({
    bitset: Bitset.fromBinaryString(bitset),
    index: index,
    isComplete: path.length > 2 && path[0] === path[path.length - 1],
    path: path,
  }));
};

const CircleGraphs = () => {
  const [{ activeNodeIndex, traversals }, setGraphProps] = useState<{
    activeNodeIndex: undefined | number;
    traversals: Traversal[];
  }>({
    activeNodeIndex: undefined,
    traversals: [],
  });

  const match = useMatchMedia(['600px']);
  const refVisualisation = useRef<HTMLElement>(null);
  const resultUseGraphHook = useGraph(sampleCircles, traversals);

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

  const rules = [
    {
      description:
        'After traversing from one node to another, you cannot traverse back to the same node.',
      number: 1,
      state: [30, traversalConfig1],
      title: 'No going back',
    },
    {
      description:
        'The traversal path must not cross into or out of any circles that have been traversed before.',
      number: 2,
      state: [29, traversalConfig1],
      title: 'Within bounds',
    },
    {
      description:
        'The Bitset of a traversal with 2 or more edges must not exist in previous traversals.',
      number: 3,
      state: [50, traversalConfig2],
      title: 'Unique',
    },
    {
      description: 'A node can only be visited a maximum of 4 times.',
      number: 4,
      state: [10, traversalConfig3],
      title: 'Node 4 max traversals',
    },
    {
      description: 'An edge can only be visited a maximum of 2 times.',
      number: 5,
      state: [61, traversalConfig4],
      title: 'Edge 2 max traversals',
    },
  ];

  return (
    <WritingPage {...data.writings.CircleGraphs}>
      <WritingSection>
        <WritingParagraph>
          <BlockQuote emphasis>
            This is a rewrite of a previous article, which I didn't like as it
            didn't focus on the main concept of traversing the intersections
            with graphs. You can read the origin article{' '}
            <Link to="/writings/circle-intersections" underline>
              here
            </Link>
            .
          </BlockQuote>
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph>
          Calculating the regions of intersecting circles can be solved
          completely geometrically, by iterating through all of the circle
          intersections, and reducing the results into intersected and
          subtracted areas, until there are none left. However, this can also be
          done with graphs.
        </WritingParagraph>

        <WritingParagraph>
          Graphs are a data structure made up of nodes, which can be connected
          to one or more nodes with edges. You can then use these edges to
          traverse from node to node (visual representation below).
        </WritingParagraph>

        <WritingFigs>
          <WritingFig description="Graph visual representation" number={1}>
            <Image src={require('./writings-circles-graph-1.svg')} />
          </WritingFig>
        </WritingFigs>

        <WritingParagraph>
          For this concept of finding the intersections, our graph will be made
          up of nodes that represent the points of intersection (how we get
          these, coming up), and the connections between the nodes (the edges)
          will be the arcs between the intersection points (more on this).
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Finding the nodes and edges</WritingHeading>

        <WritingParagraph>
          Starting with any number of circles, for which we know the center
          point (as <Code>X</Code> and <Code>Y</Code> coordinates and the radius
          of the circle. The only geometric calculation we have to do to get our
          starting dataset of arcs is to test each circle against every other
          circle for an intersection (This is already a{' '}
          <Link
            href="http://mathworld.wolfram.com/Circle-CircleIntersection.html"
            target="CircleIntersections"
            underline
          >
            well solved problem
          </Link>
          ).
        </WritingParagraph>

        <WritingParagraph>
          Using all of the intersection points (our nodes), we have a reference
          to the 2 circles that contributed to the intersection, and we can
          determine the arcs (the edges) by finding the next intersection point
          (counter/clockwise) of each of the circles involved in the
          intersection.
        </WritingParagraph>

        <WritingFigs>
          <WritingFig
            description="Arrangement of three intersecting circles. A graph in it's entirety"
            number={2}
          >
            <Image src={require('./writings-circles-graph-2.svg')} />
          </WritingFig>
        </WritingFigs>

        <WritingParagraph>
          From here, we can now use the identified nodes to describe areas of
          intersection. For example, <Code>[0 -&gt; 2 -&gt; 1 -&gt; 0]</Code>,
          would describe the top most intersection area.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>A quick edge case</WritingHeading>

        <WritingParagraph>
          Before we start looking at how to traverse this graph to find the
          intersection areas, consider this edge case. With the circle
          arrangement in Fig 2, we can easily describe the path of every single
          one of those intersection areas by using the node identifiers. Now
          consider Fig 3, where there are just 2 overlapping circles, giving us
          just 2 nodes on our graph, but 4 edges.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="800px">
        <WritingFig
          description="Arrangement of two intersecting circles."
          number={3}
        >
          <Image src={require('./writings-circles-graph-3.svg')} />
        </WritingFig>

        <WritingFig
          description="Arrangement of two intersecting circles, with labelled edges."
          number={4}
        >
          <Image src={require('./writings-circles-graph-4.svg')} />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          How are we now supposed to describe a path that makes up the
          intersection areas? If I said <Code>[0 -&gt; 1 -&gt; 0]</Code> or{' '}
          <Code>[1 -&gt; 0 -&gt; 1]</Code>, which one of the intersection areas
          does that cover?
        </WritingParagraph>

        <WritingParagraph>
          We also need to be able to identify the edges, so we can specify which
          one we want to traverse (Fig 4). Now we can describe traversals like{' '}
          <Code>[0.2.1 -&gt; 1.3.0]</Code>, in other words "Traverse from node 0
          to node 1 via edge 2, then traverse from node 1 to node 0 via edge 3",
          to get us the left most intersection are.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Storing traversals</WritingHeading>

        <WritingParagraph>
          Now that we have a way to refer to these traversals we need to be able
          to store them (this will become apparent in just a moment). One thing
          we need to consider with storing traversals, is we need to be able to
          reference them irrespective of the direction the graph has been
          traversed.
        </WritingParagraph>

        <WritingParagraph>
          Using Fig 4 as an example, the intersection described as{' '}
          <Code>[0.2.1 -&gt; 1.3.0]</Code>, we could have traversed in the
          opposite direction, giving us a path of{' '}
          <Code>[0.3.1 -&gt; 1.2.0]</Code>. We could have also started at Node
          1, giving us another 2 possible paths of{' '}
          <Code>[1.3.0 -&gt; 0.2.1]</Code> and <Code>[1.2.0 -&gt; 0.3.1]</Code>.
        </WritingParagraph>

        <WritingParagraph>
          One way to overcome this is to store them in a Bitset (a sequence of
          0s and 1s), where each Bit refers to the index of a Node or an Edge.
          If the Node or Edge is used in the traversal, we flip the Bit to a 1,
          if not it remains a 0.
        </WritingParagraph>

        <WritingFigs>
          <WritingFig
            description="Bitsets of all the valid traversals in Fig 4"
            number={5}
          >
            <Image src={require('./writings-circles-graph-5.svg')} />
          </WritingFig>
        </WritingFigs>

        <WritingParagraph>
          This may seem unnecessary with the example above of 2 nodes as we
          could easily stored all 4 combinations, however the number of
          permutations follows <Code>nodes visited * 4</Code>, so 3 nodes has 12
          permutations, 4 nodes has 16, 5 has 20, etc... Using a Bitset we can
          cover all the possible variations with a single comparable entity.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>The rules for a traversal</WritingHeading>

        <WritingParagraph>
          To form all the valid intersections paths existing in our graph, we
          can traverse the graph while applying {rules.length} very simple
          rules.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        {rules.map(({ description, number, state: [a, b], title }) => (
          <Box key={number} margin="x3">
            <RuleBox
              description={description}
              number={number}
              onClick={() =>
                handleSetTraversals(a as number, b as TraversalJSON[])
              }
              title={title}
            />
          </Box>
        ))}
      </WritingSection>

      <WritingSection>
        <WritingHeading>
          An interactive intersection graph explorer
        </WritingHeading>

        <WritingParagraph>
          Below is an interactive explorer that allows you to click on the
          intersection points to create intersecting regions. Showing you what
          are the valid points, and what the reasons for their exclusion.
        </WritingParagraph>
      </WritingSection>

      <WritingSection
        flex="vertical"
        gap="x8"
        maxWidth="1400px"
        padding="x6"
        ref={refVisualisation}
      >
        <Box>
          <IntersectionExplorer
            {...resultUseGraphHook}
            activeNodeIndex={activeNodeIndex}
          />
        </Box>

        <Box
          alignChildrenHorizontal={match('600px') ? 'middle' : undefined}
          flex="vertical"
        >
          <Box
            alignChildrenVertical="end"
            borderBottom
            borderSize="x2"
            flex="horizontal"
          >
            <Box borderSize="x1" height="16px" />
            <Box
              alignChildren={match('600px') ? 'middle' : undefined}
              flex={match('600px') ? 'horizontal' : 'vertical'}
              gap="x6"
              grow
              padding="x3"
            >
              {rules.map(({ description, number, state: [a, b], title }) => (
                <Box key={number}>
                  <RuleBox
                    asIcon
                    description={description}
                    number={number}
                    onClick={() =>
                      handleSetTraversals(a as number, b as TraversalJSON[])
                    }
                    title={title}
                  />
                </Box>
              ))}
            </Box>
            <Box borderSize="x1" height="16px" />
          </Box>

          <Text align="middle" margin="x2" size="x1" strong uppercase>
            Rule Example Configurations
          </Text>
        </Box>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Summary</WritingHeading>

        <WritingParagraph>
          While re-writing this article, it occurred to me that this approach is
          not isolated to just circles. Without any exploration into this
          thought, I believe this approach could be applied to any shapes.
        </WritingParagraph>

        <WritingParagraph>
          I haven't done any benchmarks on the performance of this algorithm,
          nor have I spent any time optimizing my implementation, however in
          theory it should be pretty fast 🤷‍♂️.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <Text margin="x6">
          <Text strong>Harrison Hogg</Text>
          <Text>Software Engineer</Text>
        </Text>
      </WritingSection>
    </WritingPage>
  );
};

export default CircleGraphs;
