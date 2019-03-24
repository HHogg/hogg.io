import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { CheckBox, Input } from 'preshape';

export default class TilingEditorOptions extends PureComponent {

  static propTypes = {
    config: PropTypes.shape({
      animate: PropTypes.bool.isRequired,
      disableColoring: PropTypes.bool.isRequired,
      disableRepeating: PropTypes.bool.isRequired,
      fadeConnectedShapes: PropTypes.bool.isRequired,
      maxRepeat: PropTypes.number.isRequired,
      showAxis: PropTypes.bool.isRequired,
      shapeSize: PropTypes.number.isRequired,
      showTransforms: PropTypes.bool.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      maxRepeat: props.config.maxRepeat,
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
    const { config, onConfigChange } = this.props;
    const { maxRepeat, shapeSize } = this.state;

    return (
      <Fragment>
        <CheckBox
            checked={ config.animate }
            label="Animate Stages"
            margin="x2"
            onChange={ () => onConfigChange({ animate: !config.animate }) } />

        <CheckBox
            checked={ config.disableColoring }
            label="Disable Colouring"
            margin="x2"
            onChange={ () => onConfigChange({ disableColoring: !config.disableColoring }) } />

        <CheckBox
            checked={ config.disableRepeating }
            label="Disable Repeating"
            margin="x2"
            onChange={ () => onConfigChange({ disableRepeating: !config.disableRepeating }) } />

        <CheckBox
            checked={ config.fadeConnectedShapes }
            label="Fade Connected Shapes"
            margin="x2"
            onChange={ () => onConfigChange({ fadeConnectedShapes: !config.fadeConnectedShapes })} />

        <CheckBox
            checked={ config.showAxis }
            label="Show Axis"
            margin="x2"
            onChange={ () => onConfigChange({ showAxis: !config.showAxis }) } />

        <CheckBox
            checked={ config.showTransforms }
            label="Show Transformations"
            margin="x2"
            onChange={ () => onConfigChange({ showTransforms: !config.showTransforms }) } />

        <Input
            label="Maximum Transform Repeats"
            margin="x2"
            onChange={ (e) => this.handleNumberChange(e, 'maxRepeat', 1) }
            placholder="Maximum transform repeats..."
            type="number"
            value={ maxRepeat } />

        <Input
            label="Shape Size"
            margin="x2"
            onChange={ (e) => this.handleNumberChange(e, 'shapeSize', 60, 100) }
            placholder="Shape size..."
            type="number"
            value={ shapeSize } />
      </Fragment>
    );
  }
}
