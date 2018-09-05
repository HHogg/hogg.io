import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Base, CheckBox, Input, RadioButton, Text } from 'preshape';
import {
  ArchimedesSpiral,
  ConcentricCircles,
  FermatSpiral,
  UlamSpiral,
  VogelSpiral,
} from 'sysplot';

export const algorithms = [
  ['Archimedes Spiral', ArchimedesSpiral],
  ['Concentric Circles', ConcentricCircles],
  ['Fermat Spiral', FermatSpiral],
  ['Ulam Spiral', UlamSpiral],
  ['Vogel Spiral', VogelSpiral],
];

export default class SysPlotControls extends Component {
  static propTypes = {
    config: PropTypes.shape({
      algorithm: PropTypes.func.isRequired,
      proportional: PropTypes.bool.isRequired,
      padding: PropTypes.number.isRequired,
      shapes: PropTypes.bool.isRequired,
      shapeCount: PropTypes.number.isRequired,
      spread: PropTypes.number.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      padding: props.config.padding,
      spread: props.config.spread,
      shapeCount: props.config.shapeCount,
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
    const { config, onConfigChange } = this.props;
    const { padding, shapeCount, spread } = this.state;

    return (
      <Fragment>
        <Base margin="x8">
          <Text margin="x4" strong>Plotting Algorithms</Text>

          { algorithms.map(([algorithmName, algorithm]) => (
            <RadioButton
                checked={ config.algorithm === algorithm }
                key={ algorithmName }
                label={ algorithmName }
                margin="x2"
                onChange={ () => onConfigChange({ algorithmName, algorithm }) } />
          )) }
        </Base>

        <Base margin="x8">
          <Text margin="x4" strong>Library Configuration</Text>
          <CheckBox
              checked={ config.cover }
              label="Cover"
              margin="x2"
              onChange={ () => onConfigChange({ cover: !config.cover }) } />

          <CheckBox
              checked={ config.proportional }
              label="Preserve Aspect Ratio"
              margin="x2"
              onChange={ () => onConfigChange({ proportional: !config.proportional }) } />

          <Input
              label="Padding"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'padding') }
              placholder="Padding..."
              type="number"
              value={ padding } />

          <Input
              label="Spread"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'spread') }
              placholder="Spread..."
              step="0.05"
              type="number"
              value={ spread } />
        </Base>

        <Base margin="x8">
          <Text margin="x4" strong>Demo Configuration</Text>

          <CheckBox
              checked={ config.vectors }
              label="Show Vectors"
              margin="x2"
              onChange={ () => onConfigChange({ vectors: !config.vectors }) } />

          <CheckBox
              checked={ config.shapes }
              label="Show Shapes"
              margin="x2"
              onChange={ () => onConfigChange({ shapes: !config.shapes }) } />

          <Input
              label="Shape Count"
              margin="x2"
              onChange={ (e) => this.handleNumberChange(e, 'shapeCount', 0, 200) }
              placholder="Shape count..."
              type="number"
              value={ shapeCount } />
        </Base>
      </Fragment>
    );
  }
}
