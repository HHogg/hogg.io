import React, { Component } from 'react';
import { Base } from 'preshape';

export default class TimelinePoint extends Component {
  render() {
    return (
      <Base { ...this.props } className="Timeline__point" />
    );
  }
}
