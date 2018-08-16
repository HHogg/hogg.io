import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import {
  Application,
  ApplicationDetails,
  ApplicationFooter,
  ApplicationThemeControls,
  ApplicationTitle,
  Flex,
  Link,
  SwitchTransition,
} from 'preshape';
import projectsDetails from './Projects/projectsDetails';
import projectsList from './Projects/projectsList';
import Landing from './Landing/Landing';
import ProjectsTimeline from './ProjectsTimeline/ProjectsTimeline';

export const widthSmall = '48rem';
export const widthMedium = '64rem';
export const widthLarge = '72rem';

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visited: false,
      theme: 'day',
    };
  }

  render() {
    const { theme, visited } = this.state;

    return (
      <Application
          onChangeTheme={ (theme) => this.setState({ theme }) }
          theme={ theme }>
        <Route path="/:anthing" render={ () => (
          <ApplicationTitle padding="x4">
            <Flex
                alignChildrenHorizontal="between"
                alignChildrenVertical="start"
                direction="horizontal">
              <Flex>
                <Link size="small" to="/">Hogg.io</Link>
              </Flex>

              <Flex>
                <ApplicationThemeControls
                    alignChildrenHorizontal="end" />
              </Flex>
            </Flex>

          </ApplicationTitle>
        ) } />

        <SwitchTransition
            Component={ Flex }
            direction="vertical"
            grow>

          <Route exact path="/" render={ () =>
            <Landing
                onLand={ () => this.setState({ visited: true }) }
                visited={ visited } />
          } />

          <Route component={ ProjectsTimeline } exact path="/timeline" />

          { projectsList
            .filter(({ code }) => projectsDetails[code])
            .map(({ code, to }) => (
              <Route key={ code } path={ to } render={ () =>
                React.createElement(projectsDetails[code], { code })
              } />
            )) }
        </SwitchTransition>

        <ApplicationFooter padding="x4">
          <ApplicationDetails
              alignChildrenHorizontal="middle"
              github="https://github.com/HHogg/hogg.io" />
        </ApplicationFooter>
      </Application>
    );
  }
}
