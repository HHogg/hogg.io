import React, { Component } from 'react';
import random from 'lodash.random';
import zip from 'lodash.zip';
import { Bounds, Flex, Responsive, Text, ThemeContext } from 'preshape';
import SysPlot from 'sysplot';
import sysPlotReadme from 'sysplot/README.md';
import { widthSmall, widthMedium } from '../../Root';
import Project from '../../Project/Project';
import SysPlotControls, { algorithms } from './SysPlotControls';
import SysPlotVisual from './SysPlotVisual';
import ReadMe from '../../ReadMe/ReadMe';

const area = (shape) => Math.PI * (shape.radius * shape.radius);

export default class SysPlotProject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      algorithm: algorithms[4][1],
      algorithmName: algorithms[4][0],
      aspectRatio: 1,
      cover: true,
      padding: 5,
      positions: null,
      proportional: false,
      shapeCount: 100,
      showShapes: true,
      showVectors: true,
      spread: 0.1,
    };

    this.sysPlot = new SysPlot();
    this.regenerateShapes(this.state);
  }

  setBounds({ width, height }) {
    this.sysPlot.setBounds(width, height);
    this.getPositions(this.state);
  }

  getPositions(config) {
    this.sysPlot.setConfig({
      algorithm: config.algorithm,
      aspectRatio: config.aspectRatio,
      cover: config.cover,
      padding: config.padding,
      proportional: config.proportional,
      spread: config.spread,
    });

    const positions = zip(
        this.sysPlot.shapes,
        this.sysPlot.getPositions(),
      ).filter(([, p]) => p);

    this.setState({
      ...config,
      positions: config.showShapes ? positions : [],
      vectors: config.showVectors ? this.sysPlot.vectors : [],
    });
  }

  regenerateShapes(config) {
    const shapeCount = parseInt(config.shapeCount);
    const shapes = isNaN(shapeCount) || config.showShapes === false ? [] :
      Array.from({ length: shapeCount }).map(() => ({
        radius: random(5, 30),
      })).sort((a, b) => area(b) - area(a));

    this.sysPlot.setShapes(shapes);
  }


  handleConfigChange(configUpdate) {
    const config = {
      ...this.state,
      ...configUpdate,
    };

    if ('shapeCount' in config) {
      this.regenerateShapes(config);
    }

    this.getPositions(config);
  }

  render() {
    const {
      algorithm,
      algorithmName,
      aspectRatio,
      cover,
      padding,
      positions,
      proportional,
      shapeCount,
      showShapes,
      showVectors,
      spread,
      vectors,
    } = this.state;

    const controlsConfig = {
      algorithm,
      aspectRatio,
      cover,
      padding,
      proportional,
      shapeCount,
      showShapes,
      showVectors,
      spread,
    };

    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex
                direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                gap="x8"
                grow>
              <Flex
                  alignChildrenVertical="end"
                  backgroundColor="shade-2"
                  color
                  container
                  direction="vertical"
                  gap="x4"
                  grow
                  initial={ match(widthSmall) ? 'none' : null }
                  minHeight="35rem"
                  padding="x4"
                  theme="night">
                <Bounds absolute="fullscreen" onChange={ (bounds) => this.setBounds(bounds) }>
                  { ({ width, height }) => (
                    width && height && this.sysPlot.vectors && (
                      <ThemeContext.Consumer>
                        { ({ theme }) => (
                          <SysPlotVisual
                              height={ height }
                              positions={ positions }
                              theme={ theme }
                              vectors={ vectors }
                              width={ width } />
                        ) }
                      </ThemeContext.Consumer>
                    )
                  ) }
                </Bounds>

                <Flex container>
                  <Text size="x1"><Text inline strong>Algorithm:</Text> { algorithmName }</Text>
                  <Text size="x1"><Text inline strong>Aspect Ratio:</Text> { aspectRatio }</Text>
                  <Text size="x1"><Text inline strong>Cover:</Text> { cover.toString() }</Text>
                  <Text size="x1"><Text inline strong>Padding:</Text> { padding }</Text>
                  <Text size="x1"><Text inline strong>Proportional:</Text> { proportional.toString() }</Text>
                  <Text size="x1"><Text inline strong>Spread:</Text> { spread }</Text>
                </Flex>

                <Flex container>
                  <Text size="x1"><Text inline strong>Vectors:</Text> { this.sysPlot.vectors ? this.sysPlot.vectors.length : '-' }</Text>
                </Flex>
              </Flex>

              <Flex>
                <SysPlotControls
                    config={ controlsConfig }
                    onConfigChange={ (config) => this.handleConfigChange(config) } />
              </Flex>
            </Flex>
          ) }
        </Responsive>

        <ReadMe margin="x16">
          { sysPlotReadme }
        </ReadMe>
      </Project>
    );
  }
}
