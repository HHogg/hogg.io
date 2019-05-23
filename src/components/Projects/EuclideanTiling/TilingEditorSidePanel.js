import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { Flex, Icon, Link, Text } from 'preshape';

export default class TilingEditorSidePanel extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string.isRequired,
  };

  render() {
    const {
      children,
      isOpen,
      onClose,
      title,
    } = this.props;

    const classes = classnames('TilingEditor__side-panel', {
      'TilingEditor__side-panel--open': isOpen,
    });

    return (
      <Flex
          backgroundColor
          className={ classes }
          container
          direction="vertical"
          grow
          initial="none">
        <Flex
            className="TilingEditor__side-panel-content"
            grow
            initial="none"
            scrollable>
          <Flex
              direction="vertical"
              gap="x4"
              padding="x4">
            <Flex
                alignChildrenVertical="middle"
                direction="horizontal"
                gap="x2">
              <Flex grow>
                <Text ellipsis size="x1" strong>{ title }</Text>
              </Flex>

              { onClose && (
                <Flex>
                  <Link onClick={ onClose }>
                    <Icon name="Cross" size="1rem" />
                  </Link>
                </Flex>
              ) }
            </Flex>

            <Flex>
              { children }
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
