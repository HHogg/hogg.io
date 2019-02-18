import PropTypes from 'prop-types';
import React, { Component } from 'react';
import omit from 'lodash.omit';
import { Flex, Responsive, Text } from 'preshape';
import projectsMap from '../Projects/projectsMap';
import { widthSmall } from '../Root';
import Element from '../Element/Element';
import ProjectDescription from './ProjectDescription';
import './Project.css';

export default class Project extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    code: PropTypes.string.isRequired,
    gap: PropTypes.string,
  };

  render() {
    const { children, code, gap, ...rest } = this.props;
    const { number } = projectsMap[code];

    return (
      <Responsive queries={ [widthSmall] }>
        { (match) => (
          <Flex { ...omit(rest, ['onChangeTheme', 'theme']) }
              className="Project"
              direction="vertical"
              gap="x10"
              grow
              paddingHorizontal="x4"
              paddingVertical="x6">
            <Flex
                alignChildrenHorizontal={ match(widthSmall) ? 'start' : 'middle' }
                alignChildrenVertical="end"
                direction="horizontal"
                gap="x6"
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

            <Flex direction="vertical" gap={ gap } grow>
              { children }
            </Flex>
          </Flex>
        ) }
      </Responsive>
    );
  }
}
