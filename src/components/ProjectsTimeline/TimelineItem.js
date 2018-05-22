import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { transitionTimeFast, Appear } from 'preshape';

export default class TimelineItem extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    index: PropTypes.number,
  };

  render() {
    const { children, delay, index, ...rest } = this.props;

    return (
      <Appear { ...rest }
          className="Timeline__item"
          delay={ delay + (transitionTimeFast * index) }>
        <Appear
            animation="ScaleYDown"
            className="Timeline__line"
            delay={ delay + ((transitionTimeFast * index) + transitionTimeFast) } />
        { children }
      </Appear>
    );
  }
}
