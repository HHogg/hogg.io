import {
  ArticleFig,
  ArticleFigs,
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
} from '@hogg/common';
import { BulletPoint, BulletPoints, Code, Image, Link, Text } from 'preshape';
import SnakeSolution from './SnakeSolution';
import SnakeSolutionComparisonAverage from './SnakeSolutionComparisonAverage';
import SnakeSolutionComparisonScore from './SnakeSolutionComparisonScore';
import image1 from './images/image-1.gif';
import {
  Solution,
  euclideanDistance,
  hamiltonianCycle,
  manhattanDistance,
  tailEscape,
} from './solutions';

type Props = {
  onSelectSolution: (solution: Solution) => void;
};

const Article = ({ onSelectSolution }: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleParagraph>
          The classic game of Snake is a simple concept but it has some
          interesting problems when it comes to creating a programmatic
          solution. When I came across this gif of 'the perfect game' it made me
          curious how a programmatic solution would work.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            alignChildren="middle"
            flex="vertical"
            description="A gif from the internet showing a full complete game of snake."
          >
            <Image src={image1} />
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Pathfinding</ArticleHeading>

        <ArticleParagraph>
          If you're not familiar with the game, the basic explanation of it is
          to guide the snake across the map to the point, avoiding collisions
          with itself or the walls. This general problem of finding a path from
          a starting point to an endpoint can be applied to lots of other
          applications. Graphs, made up of nodes and edges are a common data
          structure used in pathfinding.
        </ArticleParagraph>

        <ArticleParagraph>
          Starting at one node on the graph, using the connected edges to
          traverse the graph looking for another node for whatever reason.
          Different methods can be used to find the 'best' path between two
          nodes, it might be the shortest path, the fastest path, or the path
          that avoids certain nodes. Depth first search and breadth first search
          are two common methods of traversing a graph, but they are not
          guaranteed to find the best path and there's trade-offs depending on
          the type of graph.
        </ArticleParagraph>

        <ArticleParagraph>
          Here, we'll use the A* algorithm to find the best path. A* is a
          heuristic search algorithm, meaning it uses a heuristic to estimate
          the distance between two nodes. The heuristic is used to prioritize
          which nodes to visit first, and the algorithm will visit nodes in
          order of priority.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Analyzing optimality</ArticleHeading>

        <ArticleParagraph>
          To determine the optimality of the solution we need a way to analyse
          them, and for that we can track a couple of metrics and create a
          scoring system.
        </ArticleParagraph>

        <BulletPoints margin="x4">
          <BulletPoint>
            <Text tag="span" weight="x2">
              Points:{' '}
            </Text>{' '}
            The number of points that the snake collects is an indication to how
            successful the solution is. The more points, the longer the snake
            lasted, and so the better the solution is at avoiding crashes while
            also collecting points.
          </BulletPoint>

          <BulletPoint>
            <Text tag="span" weight="x2">
              Cumulative moving average:{' '}
            </Text>{' '}
            Tracking the number of moves from point to point helps to see the
            efficiency of the solution throughout the game. As the snake gets
            longer from collecting points, there are less available spaces on
            the grid for the next point to generate, so the efficiency of the
            solution is less important towards the end then it is at the
            beginning. We can use a cumulative moving average here to smooth out
            the variability that comes from the randomness of the point
            positioning.
          </BulletPoint>
        </BulletPoints>

        <ArticleParagraph>
          The scoring system will be a cumulative score of the current point
          weighted by the moving average, the current path length and progress
          into completing the game. The weight of the progress is less impactful
          towards the end.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Heuristics</ArticleHeading>

        <ArticleParagraph>
          The solutions below are all heuristic functions that will be run for
          each cell on the map. Whichever node around the head of the snake has
          the lowest value, will be the node the snake will move to next. This
          will continue to happen until either the snake has crashed or the game
          is complete.
        </ArticleParagraph>

        <ArticleParagraph>
          The live runner can be used to play out a game of snake with that
          solution.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleParagraph weight="x2">Manhattan Distance</ArticleParagraph>

        <ArticleParagraph>
          The Manhattan Distance is a taxicab metric of{' '}
          <Link
            href="https://en.wikipedia.org/wiki/Taxicab_geometry"
            target="SnakeSolution"
            underline
          >
            Taxicab geometry
          </Link>
          . The name comes from the grid layout of streets on the island of
          Manhattan, and the function is the absolute distance between two
          points.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs theme="night">
        <ArticleFig description="Manhattan Distance." padding="x0">
          <SnakeSolution
            onSelect={onSelectSolution}
            solution={manhattanDistance}
          />
        </ArticleFig>
      </ArticleFigs>

      <ArticleSection>
        <ArticleParagraph weight="x2">Euclidean Distance</ArticleParagraph>

        <ArticleParagraph>
          The Euclidean Distance is the straight-line distance between two
          points in Euclidean space and is given by the Pythagorean formula (a²
          + b² = c², or in Javascript we can use <Code>Math.hypot</Code>).
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs theme="night">
        <ArticleFig description="Euclidean Distance." padding="x0">
          <SnakeSolution
            onSelect={onSelectSolution}
            solution={euclideanDistance}
          />
        </ArticleFig>
      </ArticleFigs>

      <ArticleSection>
        <ArticleParagraph>
          This ultimately leads to just an alternative path of the Manhattan
          Distance, but a more diagonal route. The analysis is almost identical
          to the solution shown in Fig 2, because likewise it does nothing to
          handle the environment, and simply just knows about moving towards the
          point.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleParagraph weight="x2">Hamiltonian Cycle</ArticleParagraph>

        <ArticleParagraph>
          A{' '}
          <Link
            href="https://en.wikipedia.org/wiki/Hamiltonian_path"
            target="SnakeSolution"
            underline
          >
            Hamiltonian Path
          </Link>{' '}
          is a path that visits each node of a graph exactly once, and a
          Hamiltonian Cycle is where the final node visited connects back to the
          first node and allows the exact same path to be repeated continuously.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs theme="night">
        <ArticleFig description="Hamiltonian Cycle." padding="x0">
          <SnakeSolution
            onSelect={onSelectSolution}
            solution={hamiltonianCycle}
          />
        </ArticleFig>
      </ArticleFigs>

      <ArticleSection>
        <ArticleParagraph>
          This is a methodical solution but has very poor efficiency towards the
          start of the game due to the unnecessary number of moves that are not
          weighted to moving towards the direction of the point.
        </ArticleParagraph>

        <ArticleParagraph>
          On an even sided grid this has the consistent behaviour of getting
          100% completion, however on an odd sided grid it is almost impossible
          due to the cycle needing to alternate it's direction (see Fig 5) and
          ultimately crashing into itself.
        </ArticleParagraph>

        <ArticleParagraph emphasis>
          Note: This is not a true Hamiltonian Path or Cycle because of the need
          to alternate the path and visiting some nodes for a second time before
          getting back to the start.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleParagraph weight="x2">Tail Escape</ArticleParagraph>

        <ArticleParagraph>
          Some observations we can make from the previous solutions is that the
          ideal solution needs to have some awareness of the current environment
          to prevent crashes, like the cells occupied by the snake and the
          bounds of the map. It also needs to be weighted to move in the
          direction of the point to keep the number of moves down to a minimum.
        </ArticleParagraph>

        <ArticleParagraph>
          This solution focuses on the idea that as long as the head of the
          snake has a path back to the tail (similar to the Hamiltonian Cycle),
          then it can avoid crashing into itself by following the tail.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs theme="night">
        <ArticleFig description="Tail Escape." padding="x0">
          <SnakeSolution onSelect={onSelectSolution} solution={tailEscape} />
        </ArticleFig>
      </ArticleFigs>

      <ArticleSection>
        <ArticleParagraph>
          The randomly positioned points and the positioning of the snake means
          there will not always be a direct path to the point, so this solution
          has a few conditions.
        </ArticleParagraph>

        <BulletPoints margin="x4" numbered>
          <BulletPoint>
            If there is a direct path to the point check that the hypothetical
            position of the snake once collecting the point has a path back to
            the end of the tail, then it's a favourable option.
          </BulletPoint>

          <BulletPoint>
            If there isn't a path to the point but has a path to the tail, then
            it's still an option, but just less favourable.
          </BulletPoint>

          <BulletPoint>
            If in both situations there are no paths back to the tail, then the
            cell is not an option.
          </BulletPoint>
        </BulletPoints>

        <ArticleParagraph>
          A Breadth First Search is ideal for searching for the point and tail
          because of the snake's body providing an obstacle and thus the path to
          the point will likely not be a direct one.
        </ArticleParagraph>

        <ArticleParagraph>
          There are still times where this solution does not complete the game
          100%. Towards the end of the game, it is likely that single empty
          cells are available but cannot be manoeuvered into and when a point
          gets generated into that available cell the snake gets stuck in an
          endless loop.
        </ArticleParagraph>

        <ArticleParagraph>
          However this is the approach that seems to best resemble the behaviour
          in 'the perfect game' gif in Fig 1.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleFigs>
        <ArticleFig description="Solutions Moving Average comparison, with number of points along the X axis and average number of moves along the Y axis.">
          <SnakeSolutionComparisonAverage />
        </ArticleFig>
      </ArticleFigs>

      <ArticleFigs>
        <ArticleFig description="Solutions Score comparison, with number of points along the X axis and score at that point along the Y axis.">
          <SnakeSolutionComparisonScore />
        </ArticleFig>
      </ArticleFigs>
    </ArticlePage>
  );
};

export default Article;
