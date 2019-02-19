import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Base, Flex, Text } from 'preshape';
import './ShowcaseItem.css';

export default class ShowcaseItem extends Component {
  static propTypes = {
    author: PropTypes.string,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    svg: PropTypes.string,
  };

  render() {
    const {
      author,
      name,
      onClick,
      svg,
      ...rest
    } = this.props;

    return (
      <Flex { ...rest }
          borderColor
          borderSize="x2"
          className="ShowcaseItem"
          clickable
          direction="vertical"
          onClick={ onClick }>
        <Flex
            backgroundColor="shade-2"
            container
            height="10rem"
            theme="day">
          <Base
              absolute="fullscreen"
              dangerouslySetInnerHTML={ { __html: svg } }
              style={ { overflow: 'hidden' } } />

          <Base absolute="bottom" color padding="x2">
            <Text size="x1" strong>{ name }</Text>
            { author && <Text emphasis size="x1">by { author }</Text> }
          </Base>
        </Flex>
      </Flex>
    );
  }
}
