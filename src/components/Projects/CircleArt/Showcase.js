import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Grid } from 'preshape';

export default class Showcase extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  render() {
    const { children, ...rest } = this.props;

    return (
      <Grid { ...rest } columnWidth="1fr" gap="x4">
        { children }
      </Grid>
    );
  }
}
