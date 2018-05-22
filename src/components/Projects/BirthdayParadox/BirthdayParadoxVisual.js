import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  colorPositiveShade1,
  colorPositiveShade2,
  colorPositiveShade3,
  sizeX2Px,
  themes,
  ThemeContext,
} from 'preshape';
import {
  CartesianGrid,
  Label,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';

export default class BirthdayParadoxVisual extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    height: PropTypes.number.isRequired,
    p100: PropTypes.object.isRequired,
    p50: PropTypes.object.isRequired,
    p99: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
  };

  render() {
    const { data, height, p100, p50, p99, width } = this.props;

    return (
      <ThemeContext.Consumer>
        { ({ theme }) => (
          <LineChart
              data={ data }
              height={ height }
              width={ width }>
            <XAxis
                allowDecimals={ false }
                dataKey="people"
                domain={ ['dataMin', 'dataMax'] }
                fill={ themes[theme].colorTextShade1 }
                opacity="0.75"
                scale="linear"
                tickMargin={ sizeX2Px }
                type="number">
              <Label
                  fill={ themes[theme].colorTextShade1 }
                  opacity="0.75"
                  position="bottom">
                No. People
              </Label>
            </XAxis>

            <YAxis
                fill={ themes[theme].colorTextShade1 }
                opacity="0.75"
                tickMargin={ sizeX2Px }
                yAxisId="left">
              <Label
                  angle={ -90 }
                  fill={ themes[theme].colorTextShade1 }
                  opacity="0.75"
                  position="insideLeft"
                  style={ { textAnchor: 'middle' } }>
                Probability
              </Label>
            </YAxis>

            <YAxis
                allowDecimals={ false }
                fill={ themes[theme].colorTextShade1 }
                opacity="0.75"
                orientation="right"
                tickMargin={ sizeX2Px }
                yAxisId="right">
              <Label
                  angle={ 90 }
                  fill={ themes[theme].colorTextShade1 }
                  opacity="0.75"
                  position="insideRight"
                  style={ { textAnchor: 'middle' } }>
                No. Collisions
              </Label>
            </YAxis>

            <CartesianGrid
                opacity="0.3"
                stroke={ themes[theme].colorTextShade1 }
                strokeDasharray="4 4" />

            <Legend
                height={ 36 }
                verticalAlign="top"
                wrapperStyle={ { color: themes[theme].colorTextShade1, opacity: 0.75 } } />

            <ReferenceLine
                stroke={ colorPositiveShade1 }
                x={ p50.people } />

            <ReferenceLine
                stroke={ colorPositiveShade2 }
                x={ p99.people } />

            <ReferenceLine
                stroke={ colorPositiveShade3 }
                x={ p100.people } />

            <Line
                dataKey="probability"
                dot={ false }
                stroke={ themes.day.colorAccentShade2 }
                type="monotone"
                yAxisId="left" />

            <Line
                dataKey="collisions"
                dot={ false }
                stroke={ themes.night.colorAccentShade2 }
                type="monotone"
                yAxisId="right" />
          </LineChart>
        ) }
      </ThemeContext.Consumer>
    );
  }
}
