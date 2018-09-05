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
      algorithm: algorithms[0][1],
      algorithmName: algorithms[0][0],
      cover: false,
      padding: 5,
      positions: null,
      proportional: false,
      shapes: true,
      shapeCount: 60,
      spread: 0.25,
      vectors: true,
    };

    this.sysPlot = new SysPlot();
    this.setConfig();
    this.regenerateShapes();
  }

  setConfig() {
    this.sysPlot.setConfig({
      algorithm: this.state.algorithm,
      cover: this.state.cover,
      padding: this.state.padding,
      proportional: this.state.proportional,
      spread: this.state.spread,
    });
  }

  setBounds({ width, height }) {
    this.sysPlot.setBounds(width, height);
    this.getPositions();
  }

  getPositions() {
    this.setState({
      positions: zip(
        this.sysPlot.shapes,
        this.sysPlot.getPositions(),
      ).filter(([, p]) => p),
    });
  }

  regenerateShapes() {
    const shapeCount = parseInt(this.state.shapeCount);
    const shapes = isNaN(shapeCount) || this.state.shapes === false ? [] :
      Array.from({ length: shapeCount }).map(() => ({
        radius: random(5, 30),
      })).sort((a, b) => area(b) - area(a));

    this.sysPlot.setShapes(shapes);
  }


  handleConfigChange(config) {
    this.setState(config, () => {
      this.setConfig();

      if ('shapeCount' in config || 'shapes' in config) {
        this.regenerateShapes();
      }

      this.getPositions();
    });
  }

  render() {
    const {
      algorithm,
      algorithmName,
      cover,
      padding,
      positions,
      proportional,
      shapes,
      shapeCount,
      spread,
      vectors,
    } = this.state;

    const controlsConfig = {
      algorithm,
      cover,
      padding,
      proportional,
      shapes,
      shapeCount,
      spread,
      vectors,
    };

    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex
                direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                grow
                gutter="x8">
              <Flex
                  alignChildrenVertical="end"
                  backgroundColor="shade-2"
                  color
                  container
                  direction="vertical"
                  grow
                  gutter="x4"
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
                              vectors={ vectors ? this.sysPlot.vectors : [] }
                              width={ width } />
                        ) }
                      </ThemeContext.Consumer>
                    )
                  ) }
                </Bounds>

                <Flex container>
                  <Text size="small"><Text inline strong>Algorithm:</Text> { algorithmName }</Text>
                  <Text size="small"><Text inline strong>Cover:</Text> { cover.toString() }</Text>
                  <Text size="small"><Text inline strong>Padding:</Text> { padding }</Text>
                  <Text size="small"><Text inline strong>Proportional:</Text> { proportional.toString() }</Text>
                  <Text size="small"><Text inline strong>Spread:</Text> { spread }</Text>
                </Flex>

                <Flex container>
                  <Text size="small"><Text inline strong>Vectors:</Text> { this.sysPlot.vectors ? this.sysPlot.vectors.length : '-' }</Text>
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
