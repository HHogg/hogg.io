import flatten from 'lodash.flatten';
import React from 'react';
import { TypeHistory } from '../../Projects/Snake/types';
import getAverage from '../../Projects/Snake/utils/getAverage';
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
    y: getAverage(history.slice(0, index + 1)),
  }))
);

const seriesPoints = series.map((series) => series[series.length - 1]);

const xDomain = [1, Math.max(...series.map(({ length }) => length))];
const yDomain = [
  0,
  Math.max(...flatten(series.map((series) => series.map(({ y }) => y)))),
];

const SnakeSolutionComparisonAverage = () => {
  return (
    <SnakeSolutionComparison
      series={series}
      seriesPoints={seriesPoints}
      title="Average Moves"
      xDomain={xDomain}
      yDomain={yDomain}
    />
  );
};

export default SnakeSolutionComparisonAverage;
