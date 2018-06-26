import React, { Component } from 'react';
import { Appear, Bounds, Buttons, Button, Flex, Responsive, Text } from 'preshape';
import { widthSmall, widthMedium } from '../../Root';
import LockPickControls from './LockPickControls';
import LockPickVisual from './LockPickVisual';
import Project from '../../Project/Project';

export default class LockPick extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bobbyPins: 1,
      debug: false,
      level: 1,
      pickAttempts: 2,
    };
  }

  handleFailedPick() {
    const { bobbyPins, pickAttempts } = this.state;

    if (pickAttempts) {
      return this.setState({
        pickAttempts: pickAttempts - 1,
      });
    }

    if (bobbyPins) {
      return this.setState({
        bobbyPins: bobbyPins - 1,
        pickAttempts: 2,
      });
    }

    this.setState({
      bobbyPins: 0,
    });
  }

  handleSuccessfulPick() {
    this.setState(({ bobbyPins, level }) => ({
      bobbyPins: bobbyPins + 1,
      level: level + 1,
    }));
  }

  resetGame() {
    this.setState({
      bobbyPins: 1,
      level: 1,
      pickAttempts: 2,
    });
  }

  render() {
    const {
      bobbyPins,
      debug,
      level,
    } = this.state;

    return (
      <Project { ...this.props } maxWidth={ widthMedium }>
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex
                direction={ match(widthSmall) ? 'horizontal' : 'vertical' }
                grow
                gutter="x8">
              <Flex
                  backgroundColor="shade-1"
                  color
                  container
                  grow
                  initial={ match(widthSmall) ? 'none' : null }
                  minHeight="35rem"
                  padding="x4"
                  theme="night">

                { bobbyPins ? (
                  <Appear
                      Component={ Bounds }
                      absolute="fullscreen"
                      animation="Fade"
                      borderColor="shade-3"
                      borderSize="x1">
                    { ({ width, height }) => (
                      width && height && (
                        <LockPickVisual
                            bobbyPins={ bobbyPins }
                            debug={ debug }
                            height={ height }
                            level={ level }
                            onFailedPick={ () => this.handleFailedPick() }
                            onSuccessfulPick={ () => this.handleSuccessfulPick() }
                            width={ width } />
                      )
                    ) }
                  </Appear>
                ) : (
                  <Appear
                      Component={ Flex }
                      absolute="fullscreen"
                      alignChildren="middle"
                      animation="Fade"
                      direction="horizontal">
                    <Text>
                      <Text size="heading">Game Over</Text>
                      <Text>You're out of Bobby Pins.</Text>
                      <Buttons margin="x4">
                        <Button onClick={ () => this.resetGame() }>
                          Start again
                        </Button>
                      </Buttons>
                    </Text>
                  </Appear>
                ) }
              </Flex>

              <Flex>
                <LockPickControls
                    config={ this.state }
                    onConfigChange={ (config) => this.setState(config) }
                    stats={ [['Level', level], ['Bobby Pins', bobbyPins]] } />
              </Flex>
            </Flex>
          ) }
        </Responsive>
      </Project>
    );
  }
}
