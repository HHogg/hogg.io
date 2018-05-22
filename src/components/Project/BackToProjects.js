import React, { Component } from 'react';
import { Flex, Icon, Link, Text } from 'preshape';

export default class BackToProjects extends Component {
  render() {
    return (
      <Text { ...this.props } margin="x6">
        <Link to="/">
          <Flex alignChildrenVertical="middle" direction="horizontal">
            <Flex>
              <Icon name="ChevronLeft" size="1.5rem" />
            </Flex>

            <Flex>
              Back to projects
            </Flex>
          </Flex>
        </Link>
      </Text>
    );
  }
}
