import PropTypes from 'prop-types';
import React, { cloneElement, Children, Component } from 'react';
import classnames from 'classnames';
import { Base } from 'preshape';
import './Timeline.css';

export default class Timeline extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    compact: PropTypes.bool,
    delay: PropTypes.number,
  };

  static defaultProps = {
    delay: 0,
  };

  render() {
    const { children, compact, delay, ...rest } = this.props;
    const classes = classnames('Timeline', {
      'Timeline--compact': compact,
    });

    return (
      <Base { ...rest } className={ classes }>
        { Children
            .toArray(children)
            .map((child, index) => cloneElement(child, {
              index,
              delay,
            })) }
      </Base>
    );
  }
}
