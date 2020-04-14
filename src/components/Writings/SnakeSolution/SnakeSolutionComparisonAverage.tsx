import * as React from 'react';
import flatten from 'lodash.flatten';
import { TypeHistory, getAverage } from '@hhogg/snake';
import runEuclideanDistance from './runEuclideanDistance.json';
import runHamiltonianCycle from './runHamiltonianCycle.json';
import runManhattanDistance from './runManhattanDistance.json';
import runTailEscape from './runTailEscape.json';
import SnakeSolutionComparison from './SnakeSolutionComparison';

const histories: TypeHistory[] = [
  runManhattanDistance as TypeHistory,
  runEuclideanDistance as TypeHistory,
  runHamiltonianCycle as TypeHistory,
  runTailEscape as TypeHistory,
];

const series = histories.map((history) => history.map((_, index) => ({
  x: index + 1,
  y: getAverage(history.slice(0, index + 1)),
})));

const seriesPoints = series.map((series) => series[series.length - 1]);

const xDomain = [1, Math.max(...series.map(({ length }) => length))];
const yDomain = [0, Math.max(...flatten(series.map((series) => series.map(({ y }) => y))))];

export default () => {
  return (
    <SnakeSolutionComparison
        series={ series }
        seriesPoints={ seriesPoints }
        title="Average Moves"
        xDomain={ xDomain }
        yDomain={ yDomain } />
  );
};
