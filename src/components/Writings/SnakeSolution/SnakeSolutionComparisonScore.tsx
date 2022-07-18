import { TypeHistory, getScore } from '@hhogg/snake';
import flatten from 'lodash.flatten';
import React from 'react';
import SnakeSolutionComparison from './SnakeSolutionComparison';
import runEuclideanDistance from './runEuclideanDistance.json';
import runHamiltonianCycle from './runHamiltonianCycle.json';
import runManhattanDistance from './runManhattanDistance.json';
import runTailEscape from './runTailEscape.json';

const histories: TypeHistory[] = [
  runManhattanDistance as TypeHistory,
  runEuclideanDistance as TypeHistory,
  runHamiltonianCycle as TypeHistory,
  runTailEscape as TypeHistory,
];

const series = histories.map((history) =>
  history.map((_, index) => ({
    x: index + 1,
    y: getScore(15, 15, history.slice(0, index + 1)),
  }))
);

const seriesPoints = series.map((series) => series[series.length - 1]);

const xDomain = [1, Math.max(...series.map(({ length }) => length))];
const yDomain = [
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
