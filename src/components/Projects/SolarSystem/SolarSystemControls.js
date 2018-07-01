import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Base, CheckBox, Input, Text } from 'preshape';

export default class SolarSystemControls extends Component {
  static propTypes = {
    config: PropTypes.shape({
      heliocentric: PropTypes.bool.isRequired,
      speed: PropTypes.number.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      speed: props.config.speed,
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

  render() {
    const { speed } = this.state;
    const { config, onConfigChange } = this.props;

    return (
      <Fragment>
        <Base margin="x8">
          <Text margin="x4" strong>Configuration</Text>

          <Input
              label="Speed"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'speed', 0, 30) }
              placholder="Speed"
              type="number"
              value={ speed } />

          <CheckBox
              checked={ config.heliocentric }
              label="Heliocentric"
              margin="x2"
              onChange={ () => onConfigChange({ heliocentric: !config.heliocentric }) } />
        </Base>
      </Fragment>
    );
  }
}
