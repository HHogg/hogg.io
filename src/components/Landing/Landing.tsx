import * as React from 'react';
import { motion } from 'framer';
import { Flex, Grid, Link, Text, Icon } from 'preshape';
import data from '../../data';
import Experience from '../Experience/Experience';
import Project from '../Project/Project';
import Writing from '../Writing/Writing';
import Header from '../Header/Header';

export default () => {
  return (
    <Flex backgroundColor="background-shade-1" padding="x6">
      <Header />

      <Flex
          alignChildrenHorizontal="middle"
          direction="vertical"
          gap="x16">
        <Flex maxWidth="600px" paddingVertical="x3">
          <Flex margin="x6">
            <Text margin="x2" size="x5" strong>
              Hi. <motion.span
                  animate={ { rotate: ['0deg', '25deg', '0deg', '25deg', '0deg', '25deg', '0deg'] } }
                  initial={ { rotate: '0deg' } }
                  style={ { display: 'inline-block' } }
                  transition={ {
                    delay: 2,
                    ease: 'easeInOut',
                    loop: Infinity,
                    repeatDelay: 5,
                  } }>
                👋
              </motion.span>
            </Text>
            <Text margin="x2" size="x5" strong>I'm Harrison Hogg, a Software Engineer from Brighton, UK.</Text>
          </Flex>

          <Flex margin="x6">
            <Text margin="x3">I love designing and building things, which frequently
              sends me down rabbit holes on side projects. I studied at <Link href="https://www.open.ac.uk/" underline>The Open University</Link> where
              I received my BSc Computing and Design Honours degree. When I'm not stringing characters together, I'm
              a less than stable climbing frame for my two daughters 👧🏼👩🏼.</Text>
          </Flex>
        </Flex>

        <Flex maxWidth="930px" paddingVertical="x3">
          <Flex maxWidth="600px">
            <Text size="x4" strong>Personal Projects</Text>
            <Text margin="x3">Some of my favourite and finished personal side projects.</Text>
          </Flex>

          <Grid
              gap="x4"
              margin="x6"
              repeatWidthMin="300px">
            { Object.values(data.projects).map((project) => (
              <Project { ...project } key={ project.title } />
            )) }
          </Grid>
        </Flex>

        <Flex maxWidth="600px" paddingVertical="x3">
          <Flex margin="x6">
            <Text margin="x3" size="x4" strong>Writings</Text>
            <Text margin="x3">
              Usually when doing one of my side projects, I find something to write about and then
              add them to this list. It's like an infrequent blog with no consistent theme.
            </Text>
          </Flex>

          { Object
              .values(data.writings)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((writing) => (
                <Writing { ...writing } key={ writing.title } />
              )) }
        </Flex>

        <Flex maxWidth="600px" paddingVertical="x3">
          <Flex margin="x6">
            <Text margin="x3" size="x4" strong>Experience</Text>
            <Text margin="x3">A timeline of where and what I've worked on over the years.</Text>
          </Flex>

          { Object
              .values(data.experience)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((exp, index) => (
                <Experience { ...exp }
                    current={ index === 0 }
                    key={ exp.date } />
              )) }
        </Flex>

        <Flex
            alignChildrenHorizontal="middle"
            direction="horizontal"
            gap="x8"
            maxWidth="600px"
            paddingVertical="x8">
          <Flex>
            <Link href="mailto:harry@hogg.io">
              <Icon name="Letter" size="2rem" />
            </Link>
          </Flex>

          <Flex>
            <Link href="https://github.com/HHogg" target="Github">
              <Icon name="Github" size="2rem" />
            </Link>
          </Flex>

          <Flex>
            <Link href="https://linkedin.com/in/harrison-hogg" target="LinkedIn">
              <Icon name="LinkedIn" size="2rem" />
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
