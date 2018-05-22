import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  transitionTimeFast,
  Appear,
  Base,
  Flex,
  Icon,
  Link,
  List,
  ListItem,
  Text,
} from 'preshape';
import ProjectsTable from '../ProjectsTable/ProjectsTable';

export default class Landing extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  };

  render() {
    const { history } = this.props;

    return (
      <Flex
          alignChildrenHorizontal="middle"
          direction="horizontal"
          grow>
        <Base
            paddingHorizontal="x4"
            paddingVertical="x8">
          <Flex direction="horizontal" margin="x16">
            <Flex grow initial="none">
              <Appear
                  Component={ Text }
                  margin="x2"
                  size="title"
                  strong>
                Hi.
              </Appear>

              <Appear
                  Component={ Text }
                  delay={ transitionTimeFast * 1 }
                  margin="x2"
                  size="title"
                  strong>
                I'm Harrison Hogg, a Frontend Developer from Brighton, UK.
              </Appear>

              <Appear
                  Component={ Text }
                  delay={ transitionTimeFast * 2 }
                  margin="x4"
                  size="heading">
                Here's a collection of my professional experience and personal
                side projects.
              </Appear>
            </Flex>
          </Flex>

          <Base margin="x16">
            <ProjectsTable history={ history } />
          </Base>

          <Appear delay={ transitionTimeFast * 3 } margin="x16">
            <Flex direction="horizontal">
              <Flex grow initial="none">
                <Text margin="x3" size="heading" strong>About Me</Text>
                <Text margin="x3">I love every single part of software development but
                  most of my time is spent looking at Design Systems and
                  Pattern Libraries but I've spent a lot of time working on both
                  the frontend and backend.</Text>

                <Text margin="x3">I'm interested in your standard nerdy topics
                  like astronomy, maths, science, quirky history, anything futurology
                  but I frequently dip into my creative side with some design.</Text>

                <Text margin="x3">I studied at <Link href="http://www.open.ac.uk/">The Open
                  University</Link> where I received my BSc Computing and Design
                  Honours degree.</Text>

                <Text margin="x3">When I'm not stringing characters together, I'm
                  a less than stable climbing frame for my two daughters.</Text>

                <List alignChildren="middle" gutter="x3" margin="x12">
                  <ListItem separator="~">
                    <Link href="mailto:harry@hogg.io">
                      <Icon name="Letter" size="1.5rem" />
                    </Link>
                  </ListItem>

                  <ListItem separator="~">
                    <Link href="https://github.com/HHogg">
                      <Icon name="Github" size="1.5rem" />
                    </Link>
                  </ListItem>

                  <ListItem separator="~">
                    <Link href="https://twitter.com/hogg_io">
                      <Icon name="Twitter" size="1.5rem" />
                    </Link>
                  </ListItem>
                </List>
              </Flex>
            </Flex>
          </Appear>
        </Base>
      </Flex>
    );
  }
}
