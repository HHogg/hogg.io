import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import {
  Base,
  Button,
  Buttons,
  Input,
  Text,
} from 'preshape';

export default class BirthdayVisualControls extends Component {
  static propTypes = {
    isRunning: PropTypes.bool.isRequired,
    maxCollision: PropTypes.object.isRequired,
    onConfigChange: PropTypes.func.isRequired,
    onRunSimulation: PropTypes.func.isRequired,
    p100: PropTypes.object.isRequired,
    p50: PropTypes.object.isRequired,
    p99: PropTypes.object.isRequired,
    simulations: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      simulations: props.simulations,
    };
  }

  handleNumberChange(event, prop, min = -Infinity, max = Infinity) {
    const { value } = event.target;
    const number = Math.max(min, Math.min(max, parseFloat(value)));

    this.setState({ [prop]: value });

    if (!isNaN(number)) {
      this.props.onConfigChange({ [prop]: number });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onRunSimulation();
  }

  render() {
    const { simulations } = this.state;
    const {
      isRunning,
      maxCollision,
      p100,
      p50,
      p99,
    } = this.props;

    return (
      <Fragment>
        <Base margin="x8">
          <Text margin="x4" strong>Statistics</Text>
          { [
              ['Reached 0.50', `${p50.people} people`],
              ['Reached 0.99', `${p99.people} people`],
              ['Reached 1.00', `${p100.people} people`],
              ['Top Collisions/People', `${maxCollision.collisions}/${maxCollision.people}`],
          ].map(([ stat, value ]) => (
            <Text
                backgroundColor="text-shade-1"
                borderColor
                borderSize="x2"
                color="background-shade-1"
                key={ stat }
                margin="x2"
                paddingHorizontal="x3"
                paddingVertical="x2"
                size="small">
              <Text inline strong>{ stat }:</Text> { value }
            </Text>
          ) ) }
        </Base>

        <Base
            Component="form"
            margin="x8"
            onSubmit={ (e) => this.handleSubmit(e) }>
          <Text margin="x4" strong>Configuration</Text>

          <Input
              label="Simulations"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'simulations', 1, 1000) }
              placholder="Simulations..."
              type="number"
              value={ simulations } />

          <Buttons>
            <Button disabled={ isRunning } type="submit">
              Run Simulation
            </Button>
          </Buttons>
        </Base>
      </Fragment>
    );
  }
}
