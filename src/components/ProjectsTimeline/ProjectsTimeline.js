import React, { Component } from 'react';
import {
  transitionTimeFast,
  Base,
  Markdown,
  Responsive,
  Text,
} from 'preshape';
import { widthSmall } from '../Root';
import projectsList from '../Projects/projectsList';
import BackToProjects from '../Project/BackToProjects';
import Element from '../Element/Element';
import ProjectDescription from '../Project/ProjectDescription';
import Timeline from './Timeline';
import TimelineItem from './TimelineItem';
import TimelineItemDescription from './TimelineItemDescription';
import TimelineItemPoint from './TimelineItemPoint';

export default class ProjectsTimeline extends Component {
  render() {
    return (
      <Base maxWidth={ widthSmall } paddingHorizontal="x4" paddingVertical="x8">
        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Timeline
                compact={ !match(widthSmall) }
                delay={ transitionTimeFast }
                padding="x3">
              { projectsList
                .filter(({ timeline }) => timeline)
                .map(({ code, name, number, timeline }) => (
                  <TimelineItem id={ code } key={ code }>
                    <TimelineItemPoint>
                      <Element
                          active
                          code={ code }
                          name={ name }
                          number={ number } />
                    </TimelineItemPoint>

                    <TimelineItemDescription>
                      <ProjectDescription code={ code } />

                      <Text margin="x3">
                        <Markdown>{ timeline }</Markdown>
                      </Text>
                    </TimelineItemDescription>
                  </TimelineItem>
                )
              ) }
            </Timeline>
          ) }
        </Responsive>

        <BackToProjects />
      </Base>
    );
  }
}
