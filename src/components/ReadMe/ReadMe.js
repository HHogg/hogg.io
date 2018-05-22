import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Base, Markdown, Text } from 'preshape';

export default class ReadMe extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
  };

  render() {
    const { children, ...rest } = this.props;

    return (
      <Base { ...rest }>
        <Text
            backgroundColor="text-shade-2"
            color="background-shade-1"
            paddingHorizontal="x6"
            paddingVertical="x3"
            strong>
          README.md
        </Text>
        <Base
            borderColor="shade-2"
            borderSize="x2"
            padding="x6">
          <Markdown>{ children }</Markdown>
        </Base>
      </Base>
    );
  }
}
