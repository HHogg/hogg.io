import PropTypes from 'prop-types';
import React, { Component } from 'react';
import omit from 'lodash.omit';
import { Flex, Responsive, Text } from 'preshape';
import projectsMap from '../Projects/projectsMap';
import { widthSmall } from '../Root';
import Element from '../Element/Element';
import ProjectDescription from './ProjectDescription';

export default class Project extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    code: PropTypes.string.isRequired,
  };

  render() {
    const { children, code, ...rest } = this.props;
    const { number } = projectsMap[code];

    return (
      <Responsive queries={ [widthSmall] }>
        { (match) => (
          <Flex { ...omit(rest, ['onChangeTheme', 'theme']) }
              direction="vertical"
              grow
              gutter="x6"
              paddingHorizontal="x4">
            <Flex
                alignChildrenHorizontal={ match(widthSmall) ? 'start' : 'middle' }
                alignChildrenVertical="end"
                direction="horizontal"
                gutter="x6"
                shrink>
              <Flex>
                <Element active code={ code } number={ number } size="5rem" />
              </Flex>

              { match(widthSmall) && (
                <Flex grow shrink>
                  <ProjectDescription code={ code } />
                </Flex>
              ) }
            </Flex>

            { !match(widthSmall) && (
              <Flex>
                <Text align="middle">
                  <ProjectDescription code={ code } />
                </Text>
              </Flex>
            ) }

            <Flex direction="vertical" grow>
              { children }
            </Flex>
          </Flex>
        ) }
      </Responsive>
    );
  }
}
