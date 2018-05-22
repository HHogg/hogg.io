import React, { Component } from 'react';
import { Bounds, Flex, Responsive, ThemeContext } from 'preshape';
import { widthSmall, widthMedium } from '../../Root';
import LightRayControls from './LightRayControls';
import LightRayVisual from './LightRayVisual';

export default class LightRay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moveLightSource: true,
      shapeCount: 16,
      shapeSize: 15,
    };
  }

  render() {
    const {
      moveLightSource,
      shapeCount,
      shapeSize,
    } = this.state;

    return (
      <Responsive queries={ [widthSmall] }>
        { (match) => (
          <Flex
              direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
              grow
              gutter="x8"
              maxWidth={ widthMedium }>
            <Flex
                container
                grow
                initial={ match(widthSmall) ? 'none' : null }
                minHeight="35rem"
                padding="x4">
              <Bounds absolute="fullscreen">
                { ({ width, height }) => (
                  width && height && (
                    <ThemeContext.Consumer>
                      { ({ theme }) => (
                        <LightRayVisual
                            height={ height }
                            moveLightSource={ moveLightSource }
                            shapeCount={ shapeCount }
                            shapeSize={ shapeSize }
                            theme={ theme }
                            width={ width } />
                      ) }
                    </ThemeContext.Consumer>
                  )
                ) }
              </Bounds>
            </Flex>

            <Flex>
              <LightRayControls
                  config={ this.state }
                  onConfigChange={ (config) => this.setState(config) } />
            </Flex>
          </Flex>
        ) }
      </Responsive>
    );
  }
}
