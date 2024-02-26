import flatten from 'lodash/flatten';
import { History, getScore } from '../Presentation';
import SnakeSolutionComparison from './SnakeSolutionComparison';
import euclideanDistance from './results/euclideanDistance.json';
import hamiltonianCycle from './results/hamiltonianCycle.json';
import manhattanDistance from './results/manhattanDistance.json';
import tailEscape from './results/tailEscape.json';

const histories: History[] = [
  tailEscape as History,
  hamiltonianCycle as History,
  euclideanDistance as History,
  manhattanDistance as History,
];

const series = histories.map((history) =>
  history.map((_, index) => ({
    x: index + 1,
    y: getScore(15, 15, history.slice(0, index + 1)),
  }))
);

const seriesPoints = series.map((series) => series[series.length - 1]);

const xDomain: [number, number] = [
  1,
  Math.max(...series.map(({ length }) => length)),
];

const yDomain: [number, number] = [
  0,
  Math.max(...flatten(series.map((series) => series.map(({ y }) => y)))),
];

const SnakeSolutionComparisonScore = () => {
  return (
    <SnakeSolutionComparison
      series={series}
      seriesPoints={seriesPoints}
      title="Score"
      xDomain={xDomain}
      yDomain={yDomain}
    />
  );
};

export default SnakeSolutionComparisonScore;
