import {
  ArticleFig,
  ArticleFigs,
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
} from '@hogg/common';
import { Box, Code, Link } from 'preshape';
import { TraversalJSON } from '../Project';
import RuleBox from './RuleBox';
import SvgCirclesGraph1 from './images/CirclesGraph1';
import SvgCirclesGraph2 from './images/CirclesGraph2';
import SvgCirclesGraph3 from './images/CirclesGraph3';
import SvgCirclesGraph4 from './images/CirclesGraph4';
import SvgCirclesGraph5 from './images/CirclesGraph5';
import {
  traversalConfig1,
  traversalConfig2,
  traversalConfig3,
  traversalConfig4,
} from './traversals.json';

type Props = {
  onRuleSelect: (activeNodeIndex: number, traversals: TraversalJSON[]) => void;
};

const Article = ({ onRuleSelect }: Props) => {
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
    <ArticlePage>
      <ArticleSection>
        <ArticleParagraph>
          Calculating the regions of intersecting circles can be solved
          completely geometrically, by iterating through all of the circle
          intersections, and reducing the results into intersected and
          subtracted areas, until there are none left. However, this can also be
          done with graphs.
        </ArticleParagraph>

        <ArticleParagraph>
          Graphs are a data structure made up of nodes, which can be connected
          to one or more nodes with edges. You can then use these edges to
          traverse from node to node (visual representation below).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig description="Graph visual representation">
            <SvgCirclesGraph1 />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          For this concept of finding the intersections, our graph will be made
          up of nodes that represent the points of intersection (how we get
          these, coming up), and the connections between the nodes (the edges)
          will be the arcs between the intersection points (more on this).
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Finding the nodes and edges</ArticleHeading>

        <ArticleParagraph>
          Starting with any number of circles, for which we know the center
          point as <Code>X</Code> and <Code>Y</Code> coordinates and the radius
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
        </ArticleParagraph>

        <ArticleParagraph>
          Using all of the intersection points (our nodes), we have a reference
          to the 2 circles that contributed to the intersection, and we can
          determine the arcs (the edges) by finding the next intersection point
          (counter/clockwise) of each of the circles involved in the
          intersection.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig description="Arrangement of three intersecting circles. A graph in it's entirety">
            <SvgCirclesGraph2 />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          From here, we can now use the identified nodes to describe areas of
          intersection. For example, <Code>[0 -&gt; 2 -&gt; 1 -&gt; 0]</Code>,
          would describe the top most intersection area.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>A quick edge case</ArticleHeading>

        <ArticleParagraph>
          Before we start looking at how to traverse this graph to find the
          intersection areas, consider this edge case. With the circle
          arrangement in Fig 2, we can easily describe the path of every single
          one of those intersection areas by using the node identifiers. Now
          consider Fig 3, where there are just 2 overlapping circles, giving us
          just 2 nodes on our graph, but 4 edges.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs maxWidth="800px">
        <ArticleFig description="Arrangement of two intersecting circles.">
          <SvgCirclesGraph3 />
        </ArticleFig>

        <ArticleFig description="Arrangement of two intersecting circles, with labelled edges.">
          <SvgCirclesGraph4 />
        </ArticleFig>
      </ArticleFigs>

      <ArticleSection>
        <ArticleParagraph>
          How are we now supposed to describe a path that makes up the
          intersection areas? If I said <Code>[0 -&gt; 1 -&gt; 0]</Code> or{' '}
          <Code>[1 -&gt; 0 -&gt; 1]</Code>, which one of the intersection areas
          does that cover?
        </ArticleParagraph>

        <ArticleParagraph>
          We also need to be able to identify the edges, so we can specify which
          one we want to traverse (Fig 4). Now we can describe traversals like{' '}
          <Code>[0.2.1 -&gt; 1.3.0]</Code>, in other words "Traverse from node 0
          to node 1 via edge 2, then traverse from node 1 to node 0 via edge 3",
          to get us the left most intersection are.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Storing traversals</ArticleHeading>

        <ArticleParagraph>
          Now that we have a way to refer to these traversals we need to be able
          to store them (this will become apparent in just a moment). One thing
          we need to consider with storing traversals, is we need to be able to
          reference them irrespective of the direction the graph has been
          traversed.
        </ArticleParagraph>

        <ArticleParagraph>
          Using Fig 4 as an example, the intersection described as{' '}
          <Code>[0.2.1 -&gt; 1.3.0]</Code>, we could have traversed in the
          opposite direction, giving us a path of{' '}
          <Code>[0.3.1 -&gt; 1.2.0]</Code>. We could have also started at Node
          1, giving us another 2 possible paths of{' '}
          <Code>[1.3.0 -&gt; 0.2.1]</Code> and <Code>[1.2.0 -&gt; 0.3.1]</Code>.
        </ArticleParagraph>

        <ArticleParagraph>
          One way to overcome this is to store them in a Bitset (a sequence of
          0s and 1s), where each Bit refers to the index of a Node or an Edge.
          If the Node or Edge is used in the traversal, we flip the Bit to a 1,
          if not it remains a 0.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig description="Bitsets of all the valid traversals in Fig 4">
            <SvgCirclesGraph5 />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          This may seem unnecessary with the example above of 2 nodes as we
          could easily stored all 4 combinations, however the number of
          permutations follows <Code>nodes visited * 4</Code>, so 3 nodes has 12
          permutations, 4 nodes has 16, 5 has 20, etc... Using a Bitset we can
          cover all the possible variations with a single comparable entity.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>The rules for a traversal</ArticleHeading>

        <ArticleParagraph>
          To form all the valid intersections paths existing in our graph, we
          can traverse the graph while applying {rules.length} very simple
          rules.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        {rules.map(({ description, number, state: [a, b], title }) => (
          <Box key={number} margin="x3">
            <RuleBox
              description={description}
              number={number}
              onClick={() => onRuleSelect(a as number, b as TraversalJSON[])}
              title={title}
            />
          </Box>
        ))}
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
