import React, { Component } from 'react';
import { Bounds, Flex, Responsive, ThemeContext } from 'preshape';
import { widthSmall, widthMedium } from '../../Root';
import Project from '../../Project/Project';
import CoSineVisual from './CoSineVisual';

export default class CoSine extends Component {
  render() {
    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex direction="vertical" grow padding={ match(widthSmall) ? 'x8' : 'x0' }>
              <Flex
                  container
                  grow
                  minHeight="10rem">
                <Bounds absolute="fullscreen">
                  { ({ width, height }) => (
                    width && height && (
                      <ThemeContext.Consumer>
                        { ({ theme }) => (
                          <CoSineVisual
                              height={ height }
                              theme={ theme }
                              width={ width } />
                        ) }
                      </ThemeContext.Consumer>
                    )
                  ) }
                </Bounds>
              </Flex>
            </Flex>
          ) }
        </Responsive>
      </Project>
    );
  }
}
