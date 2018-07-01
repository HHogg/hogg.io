import React, { Component } from 'react';
import { Bounds, Flex, Responsive, Text } from 'preshape';
import format from 'date-fns/format';
import setDayOfYear from 'date-fns/set_day_of_year';
import { widthSmall } from '../../Root';
import Project from '../../Project/Project';
import SolarSystemControls from './SolarSystemControls';
import SolarSystemStats from './SolarSystemStats';
import SolarSystemVisual from './SolarSystemVisual';
import './SolarSystem.css';

export default class SolarSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      day: null,
      heliocentric: true,
      speed: 1,
    };
  }

  render() {
    const {
      day,
      heliocentric,
      speed,
    } = this.state;
    const date = setDayOfYear(Date.now(), day);

    return (
      <Project { ...this.props } theme="night">
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex
                direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                grow
                gutter="x6">

              { match(widthSmall) && (
                <Flex>
                  <SolarSystemStats />
                </Flex>
              ) }

              <Flex
                  direction="vertical"
                  grow
                  gutter="x6"
                  initial={ match(widthSmall) ? 'none' : null }>
                <Flex>
                  <Text align="middle" size="heading">
                    { format(date, 'D MMMM YYYY') }
                  </Text>
                </Flex>

                <Flex container grow minHeight="35rem">
                  <Bounds absolute="fullscreen">
                    { ({ width, height }) => (
                      !!width && !!height && (
                        <SolarSystemVisual
                            height={ height }
                            heliocentric={ heliocentric }
                            onDayChange={ (day) => this.setState({ day }) }
                            speed={ speed }
                            width={ width } />

                      )
                    ) }
                  </Bounds>
                </Flex>
              </Flex>

              <Flex>
                <SolarSystemControls
                    config={ this.state }
                    onConfigChange={ (config) => this.setState(config) } />
              </Flex>

              { !match(widthSmall) && (
                <Flex>
                  <SolarSystemStats />
                </Flex>
              ) }
            </Flex>
          ) }
        </Responsive>
      </Project>
    );
  }
}
