import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Base,
  Flex,
  Responsive,
} from 'preshape';
import projectsMap from '../Projects/projectsMap';
import { widthSmall, widthMedium } from '../Root';
import BackToProjects from './BackToProjects';
import Element from '../Element/Element';
import ProjectDescription from './ProjectDescription';
import ProjectLinks from './ProjectLinks';

export default class Project extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    code: PropTypes.string.isRequired,
  };

  render() {
    const { children, code } = this.props;
    const { github, link, name, number } = projectsMap[code];
    const hasLinks = !!(github || link);

    return (
      <Flex
          direction="vertical"
          grow
          gutter="x6"
          paddingHorizontal="x4"
          paddingVertical="x8">

        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Flex>
              <Base maxWidth={ widthMedium }>
                <Flex
                    direction="horizontal"
                    gutter="x6"
                    shrink>
                  <Flex grow={ !match(widthSmall) }>
                    <Element active code={ code } name={ name } number={ number } />
                  </Flex>

                  { match(widthSmall) && (
                    <Flex grow shrink>
                      <ProjectDescription code={ code } />
                    </Flex>
                  ) }

                  { hasLinks && (
                    <Flex>
                      <ProjectLinks code={ code } />
                    </Flex>
                  ) }
                </Flex>

                { !match(widthSmall) && (
                  <Base margin="x2">
                    <ProjectDescription code={ code } />
                  </Base>
                ) }
              </Base>
            </Flex>
          ) }
        </Responsive>


        <Flex direction="vertical" grow>
          { children }

          <BackToProjects maxWidth={ widthMedium } />
        </Flex>
      </Flex>
    );
  }
}
