import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Base, Link, Text } from 'preshape';
import TilingConfigurations from './TilingConfigurations';

export default class TilingLibrary extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    selected: PropTypes.object.isRequired,
  };

  render() {
    const {
      onSelect,
      selected,
    } = this.props;

    return TilingConfigurations.map(({ name, configurations }) => (
      <Base key={ name } margin="x6">
        <Text ellipsis margin="x1" size="x1" strong>{ name }</Text>
        { configurations.map((config) => (
          <Link
              active={ selected === config }
              display="block"
              ellipsis
              key={ config.b }
              onClick={ () => onSelect(config) }
              size="x1">
            { config.b }
          </Link>
        )) }
      </Base>
    ));
  }
}
