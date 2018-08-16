import React, { Component } from 'react';
import { themesOpposite, Base, Bounds, Flex, Link, Responsive, Text, ThemeContext } from 'preshape';
import FileSaver from 'file-saver';
import { widthSmall, widthMedium } from '../../Root';
import Project from '../../Project/Project';
import CircleArtVisual from './CircleArtVisual';
import Showcase from './Showcase';
import ShowcaseItem from './ShowcaseItem';
import configurations from './configurations';
import Fox from './configurations/Fox';
import './CircleArt.css';

const canSave = typeof window !== 'undefined' && window.Blob !== undefined;

export default class CircleArt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Fox,
      canSave: canSave,
    };
  }

  handleLoadConfig(data) {
    this.setState({ data });
  }

  handleOnClear() {
    this.setState({
      data: {
        intersections: [],
        shapes: [],
      },
    });
  }

  handleOnSave(data) {
    this.setState({ data }, () => {
      FileSaver.saveAs(
        new Blob([JSON.stringify(data, null, 2)], { type: 'text/json;charset=utf-8' }),
        `CircleArt-export_${Date.now()}.json`);
    });
  }

  render() {
    const { canSave, data } = this.state;

    return (
      <Responsive queries={ [widthSmall, widthMedium] }>
        { (match) => (
          <Project { ...this.props } maxWidth={ widthMedium }>
            <Flex
                grow
                gutter="x8"
                margin="x6">
              <Flex
                  container
                  direction="vertical"
                  grow
                  minHeight="37.5rem">
                <Bounds absolute="fullscreen">
                  { ({ width, height }) => (
                    width && height && (
                      <CircleArtVisual
                          canSave={ canSave }
                          data={ data }
                          height={ height }
                          onClear={ () => this.handleOnClear() }
                          onSave={ (data) => this.handleOnSave(data) }
                          width={ width } />
                    )
                  ) }
                </Bounds>
              </Flex>
            </Flex>

            <Base margin="x6">
              <Text margin="x2" size="heading">Showcase</Text>
              <Text color="shade-3" margin="x2">
                Built something nice? Send up
                a <Link href="https://github.com/HHogg/hogg.io">pull request</Link> with
                your saved configuration, and add it below.
              </Text>
            </Base>

            <ThemeContext.Consumer>
              { ({ theme }) => (
                <Showcase
                    columnCount={ match({
                      [widthMedium]: 4,
                      [widthSmall]: 3,
                    }) || 2 }>
                  { configurations.map(({ author, authorUrl, config, name, svg }) =>
                    <ShowcaseItem
                        author={ author }
                        authorUrl={ authorUrl }
                        key={ name }
                        name={ name }
                        onClick={ () => this.handleLoadConfig(config) }
                        svg={ svg }
                        theme={ themesOpposite[theme] } />
                  ) }
                </Showcase>
              ) }
            </ThemeContext.Consumer>
          </Project>
        ) }
      </Responsive>
    );
  }
}
