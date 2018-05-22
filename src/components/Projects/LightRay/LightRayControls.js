import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Base, CheckBox, Input, Text } from 'preshape';

export default class LightRayControls extends Component {
  static propTypes = {
    config: PropTypes.shape({
      moveLightSource: PropTypes.bool.isRequired,
      shapeCount: PropTypes.number.isRequired,
      shapeSize: PropTypes.number.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      shapeCount: props.config.shapeCount,
      shapeSize: props.config.shapeSize,
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
    const { shapeCount, shapeSize } = this.state;
    const { config, onConfigChange } = this.props;

    return (
      <Fragment>
        <Base margin="x8">
          <Text margin="x4" strong>Configuration</Text>
          <Input
              label="Shape Count"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'shapeCount', 0, 30) }
              placholder="Shape count..."
              type="number"
              value={ shapeCount } />

          <Input
              label="Shape Size"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'shapeSize', 10, 40) }
              placholder="Shape size..."
              type="number"
              value={ shapeSize } />

          <CheckBox
              checked={ config.moveLightSource }
              label="Enable dragging light source"
              margin="x2"
              onChange={ () => onConfigChange({ moveLightSource: !config.moveLightSource }) } />
        </Base>
      </Fragment>
    );
  }
}
