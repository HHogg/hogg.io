import fs from 'fs';
import { BulletPoint, BulletPoints, Code, Image, Link, Text } from 'preshape';
import * as React from 'react';
import data from '../../../data';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';

const solutionManhattanDistance = fs.readFileSync(
  __dirname + '/solutionManhattanDistance.js',
  'utf8'
);
const solutionEuclideanDistance = fs.readFileSync(
  __dirname + '/solutionEuclideanDistance.js',
  'utf8'
);
const solutionHamiltonianCycle = fs.readFileSync(
  __dirname + '/solutionHamiltonianCycle.js',
  'utf8'
);
const solutionTailEscape = fs.readFileSync(
  __dirname + '/solutionTailEscape.js',
  'utf8'
);

const SnakeRunner =
  navigator.userAgent === 'ReactSnap'
    ? () => null
    : React.lazy(() => import('./SnakeRunner'));
const SnakeSolutionComparison =
  navigator.userAgent === 'ReactSnap'
    ? () => null
    : React.lazy(() => import('./SnakeSolutionComparisonFigs'));

const SnakeSolution = () => {
  return (
    <WritingPage {...data.writings.SnakeSolution}>
      <WritingSection>
        <WritingParagraph>
          The classic game of Snake is a simple concept but it has some
          interesting problems when it comes to creating a programmatic
          solution. When I came across the notorious gif of{' '}
          <Link
            href="https://cdn.jpg.wtf/futurico/71/97/51974-6a6a0c50128edc7aacd9a223719672d3.gif"
            target="SnakeSolution"
            underline
          >
            'the perfect game'
          </Link>
          , it made me curious how a programmatic solution would work.
        </WritingParagraph>

        <WritingParagraph></WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Pathfinding</WritingHeading>

        <WritingParagraph>
          The concept of Snake is to guide the snake across the map to the
          point, avoiding collisions with itself or the walls. This general
          problem of finding a path from a starting point to an endpoint can be
          applied to lots of other applications like satellite navigation,
          routing packets across the internet, game AIs, OS file system search,
          distribution/utility networks and many more.
        </WritingParagraph>

        <WritingParagraph>
          The domain of all of these problems, including the game of snake, can
          be solved with{' '}
          <Link
            href="https://en.wikipedia.org/wiki/Graph_theory"
            target="SnakeSolution"
            underline
          >
            graph theory
          </Link>
          . Each of the places that can be visited and their connections to
          other places can be represented as nodes and edges/links on a
          mathematical structure called a graph, similar to that shown in Fig 1.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig
          description="A graph representation, nodes visualised as circles and links as lines between them."
          number={1}
        >
          <Image src={require('./writings-snake-1.svg')} />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          Graph search algorithms are used to determine the path from node to
          node, usually looking for a single specific node as the end goal.
          We'll be looking at two algorithms for the Snake solution,{' '}
          <Link
            href="https://en.wikipedia.org/wiki/Breadth-first_search"
            target="SnakeSolution"
            underline
          >
            'Breadth-First Search'
          </Link>{' '}
          and{' '}
          <Link
            href="https://en.wikipedia.org/wiki/Best-first_search"
            target="SnakeSolution"
            underline
          >
            'Best-First Search'
          </Link>
          .
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Breadth-First Search</WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig
          description="Breadth-First Search frontier ring."
          number={2}
        >
          <Image src={require('./writings-snake-2.gif')} />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          The Breadth-First Search algorithm uses a queueing system for
          exploring all of the nodes depth by depth (the queued cells are
          sometimes referred to as the frontier ring). It takes the node at the
          front of the queue and then pushes all of the connecting nodes onto
          the end of the queue. This ensures that the nodes with the closest
          links to the starting node are explored first and makes it ideal for
          finding an endpoint where the direction is unknown or if there are a
          lot of obstacles.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Best-First Search</WritingParagraph>

        <WritingParagraph>
          The Best-First Search algorithm explores a single path by prioritising
          the next node using a heuristic evaluation. This heuristic usually
          guides the path towards a known endpoint, though this will depend on
          what the heuristic function is.
        </WritingParagraph>

        <WritingParagraph>
          We'll be using a Best-First search as the main searching algorithm and
          the solutions below will be focused around writing a heuristic
          function to help decide on the path for the snake.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Analysing optimality</WritingHeading>

        <WritingParagraph>
          To determine the optimality of the solution we need a way to analyse
          them, and for that we can track a couple of metrics and create a
          scoring system, for example:
        </WritingParagraph>

        <BulletPoints margin="x4">
          <BulletPoint>
            <Text inline strong>
              Points:{' '}
            </Text>{' '}
            The number of points that the snake collects is an indication to how
            successful the solution is. The more points, the longer the snake
            lasted, and so the better the solution is at avoiding crashes while
            also collecting points.
          </BulletPoint>

          <BulletPoint>
            <Text inline strong>
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

        <WritingParagraph>
          The scoring system will be a cumulative score of the current point
          weighted by the moving average, the current path length and progress
          into completing the game. The weight of the progress is less impactful
          towards the end.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Solutions</WritingHeading>

        <WritingParagraph>
          The solutions below are all heuristic functions that will be run for
          each cell on the map. Whichever node around the head of the snake has
          the lowest value, will be the node the snake will move to next. This
          will continue to happen until either the snake has crashed or the game
          is complete.
        </WritingParagraph>

        <WritingParagraph>
          A live runner with each solution can be used to play out the game of
          snake with that solution, and is taken from my{' '}
          <Link href="https://snake.hogg.io" target="Snake" underline>
            interactive developer game
          </Link>{' '}
          of writing your own heuristic (in Javascript).
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Manhattan Distance</WritingParagraph>

        <WritingParagraph>
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
        </WritingParagraph>
      </WritingSection>

      <WritingFigs backgroundColor="dark-shade-1" textColor="light-shade-1">
        <WritingFig description="Snake runner: Manhattan Distance." number={3}>
          <React.Suspense fallback={null}>
            <SnakeRunner solution={solutionManhattanDistance} />
          </React.Suspense>
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          The Manhattan Distance is a direct solution but it's completely
          unaware of the environment so this leads to a low average numbers of
          moves but also a low number of points collected, as it crashes into
          itself quite early into the game.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Euclidean Distance</WritingParagraph>

        <WritingParagraph>
          The Euclidean Distance is the straight-line distance between two
          points in Euclidean space and is given by the Pythagorean formula (a²
          + b² = c², or in Javascript we can use <Code>Math.hypot</Code>).
        </WritingParagraph>
      </WritingSection>

      <WritingFigs backgroundColor="dark-shade-1" textColor="light-shade-1">
        <WritingFig description="Snake runner: Euclidean Distance." number={4}>
          <React.Suspense fallback={null}>
            <SnakeRunner solution={solutionEuclideanDistance} />
          </React.Suspense>
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          This ultimately leads to just an alternative path of the Manhattan
          Distance, but a more diagonal route. The analysis is almost identical
          to the solution shown in Fig 3, because likewise it does nothing to
          handle the environment, and simply just knows about moving towards the
          point.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Hamiltonian Cycle</WritingParagraph>

        <WritingParagraph>
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
        </WritingParagraph>
      </WritingSection>

      <WritingFigs backgroundColor="dark-shade-1" textColor="light-shade-1">
        <WritingFig description="Snake runner: Hamiltonian Cycle." number={5}>
          <React.Suspense fallback={null}>
            <SnakeRunner solution={solutionHamiltonianCycle} />
          </React.Suspense>
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          This is a methodical solution but has very poor efficiency towards the
          start of the game due to the unnecessary number of moves that are not
          weighted to moving towards the direction of the point.
        </WritingParagraph>

        <WritingParagraph>
          On an even sided grid this has the consistent behaviour of getting
          100% completion, however on an odd sided grid it is almost impossible
          due to the cycle needing to alternate it's direction (see Fig 5) and
          ultimately crashing into itself.
        </WritingParagraph>

        <WritingParagraph emphasis>
          Note: This is not a true Hamiltonian Path or Cycle because of the need
          to alternate the path and visiting some nodes for a second time before
          getting back to the start.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Tail Escape</WritingParagraph>

        <WritingParagraph>
          Some observations we can make from the previous solutions is that the
          ideal solution needs to have some awareness of the current environment
          to prevent crashes, like the cells occupied by the snake and the
          bounds of the map. It also needs to be weighted to move in the
          direction of the point to keep the number of moves down to a minimum.
        </WritingParagraph>

        <WritingParagraph>
          This solution focuses on the idea that as long as the head of the
          snake has a path back to the tail (similar to the Hamiltonian Cycle),
          then it can avoid crashing into itself by following the tail.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs backgroundColor="dark-shade-1" textColor="light-shade-1">
        <WritingFig description="Snake runner: Tail Escape." number={6}>
          <React.Suspense fallback={null}>
            <SnakeRunner solution={solutionTailEscape} />
          </React.Suspense>
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          The randomly positioned points and the positioning of the snake means
          there will not always be a direct path to the point, so this solution
          has a few conditions.
        </WritingParagraph>

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

        <WritingParagraph>
          A Breadth First Search is ideal for searching for the point and tail
          because of the snake's body providing an obstacle and thus the path to
          the point will likely not be a direct one.
        </WritingParagraph>

        <WritingParagraph>
          However, there are still times where this solution does not complete
          the game 100%. Towards the end of the game, it is likely that single
          empty cells are available but cannot be manoeuvered into and when a
          point gets generated into that available cell the snake gets stuck in
          an endless loop.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Summary</WritingHeading>

        <WritingParagraph>
          The four heuristic solutions above all range in complexity and
          approach. The Manhattan and Euclidean distance use a simple distance
          evaluation to determine which next cell is the closest, while the
          Hamiltonian Cycle is methodical and aims to get a greater level of
          completion over efficiency. The Tail Escape is the most complicated
          and tactful, and also most resembles{' '}
          <Link
            href="https://cdn.jpg.wtf/futurico/71/97/51974-6a6a0c50128edc7aacd9a223719672d3.gif"
            target="SnakeSolution"
            underline
          >
            'the perfect game'
          </Link>{' '}
          gif.
        </WritingParagraph>
      </WritingSection>

      <React.Suspense fallback={null}>
        <SnakeSolutionComparison />
      </React.Suspense>

      <WritingSection>
        <WritingParagraph>
          When plotting the solutions moving averages and scores for better
          comparison against one another, some observations can be made. The
          Hamiltonian Cycle, as expected, does initially have a lot of
          variability in the high average number of moves because the number of
          moves rests entirely on the random position of the point. But
          overtime, the average does decrease due to the reducing number of
          cells that the point can generate in.
        </WritingParagraph>

        <WritingParagraph>
          The Tail Escape solution starts to follow a similar line to the
          Manhattan and Euclidean distance solutions, which are as direct as
          possible. This is a good indication that despite not actually using a
          distance evaluation, the Tail Escape still moves as direct as possible
          using a breadth first search.
        </WritingParagraph>

        <WritingParagraph>
          As pointed out above, the Tail Escape solution is still not
          consistently perfect, and I suspect there is an optimisation to be
          made that ensures no unmaneuverable cells are left.
        </WritingParagraph>
      </WritingSection>
    </WritingPage>
  );
};

export default SnakeSolution;
