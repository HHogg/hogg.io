import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Base, CheckBox, Text } from 'preshape';

export default class LightRayControls extends Component {
  static propTypes = {
    config: PropTypes.shape({
      level: PropTypes.number.isRequired,
    }).isRequired,
    onConfigChange: PropTypes.func.isRequired,
    stats: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
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
    const { config, onConfigChange, stats } = this.props;

    return (
      <Fragment>
        <Base margin="x8">
          <Text margin="x4" strong>Game Stats</Text>
          { stats.map(([ stat, value ]) => (
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
          )) }
        </Base>

        <Base margin="x8">
          <Text margin="x4" strong>Configuration</Text>

          <CheckBox
              checked={ config.debug }
              label="Show Pick Area"
              margin="x2"
              onChange={ () => onConfigChange({ debug: !config.debug }) } />
        </Base>
      </Fragment>
    );
  }
}
