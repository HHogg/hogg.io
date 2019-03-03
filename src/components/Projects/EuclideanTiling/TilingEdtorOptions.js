import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { CheckBox } from 'preshape';

export default class TilingEditorOptions extends PureComponent {

  static propTypes = {
    config: PropTypes.shape({
      animate: PropTypes.bool.isRequired,
      disableColoring: PropTypes.bool.isRequired,
      disableRepeating: PropTypes.bool.isRequired,
      fadeConnectedShapes: PropTypes.bool.isRequired,
      showAxis: PropTypes.bool.isRequired,
      showTransforms: PropTypes.bool.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
  };

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
      </Fragment>
    );
  }
}
