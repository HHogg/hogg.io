import * as React from 'react';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import SnakeSolutionComparisonAverage from './SnakeSolutionComparisonAverage';
import SnakeSolutionComparisonScore from './SnakeSolutionComparisonScore';

export default () => (
  <WritingFigs maxWidth="900px">
    <WritingFig description="Solutions Moving Average comparison, with number of points along the X axis and average number of moves along the Y axis." number={ 7 }>
      <SnakeSolutionComparisonAverage />
    </WritingFig>

    <WritingFig description="Solutions Score comparison, with number of points along the X axis and score at that point along the Y axis." number={ 8 }>
      <SnakeSolutionComparisonScore />
    </WritingFig>
  </WritingFigs>
);
