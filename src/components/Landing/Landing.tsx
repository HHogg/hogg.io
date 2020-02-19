import * as React from 'react';
import { motion } from 'framer';
import { Flex, Grid, Link, Text } from 'preshape';
import data from '../../data';
import Experience from '../Experience/Experience';
import Project from '../Project/Project';
import Writing from '../Writing/Writing';
import Header from '../Header/Header';

export default () => {
  return (
    <Flex padding="x6">
      <Header />

      <Flex
          alignChildrenHorizontal="middle"
          direction="vertical"
          gap="x16">
        <Flex maxWidth="600px">
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
            <Text margin="x3">I love every single part of software development.
              Most of my time is spent looking at Design Systems and
              Pattern Libraries but I've spent a lot of time working on both
              the frontend and backend.</Text>

            <Text margin="x3">I'm interested in your standard nerdy topics
              like astronomy, maths, science, quirky history, anything futurology
              but I frequently dip into my creative side with some design.</Text>

            <Text margin="x3">I studied at <Link href="https://www.open.ac.uk/" underline>The Open University</Link> where
              I received my BSc Computing and Design Honours degree.</Text>

            <Text margin="x3">When I'm not stringing characters together, I'm
              a less than stable climbing frame for my two daughters 👧🏼👩🏼.</Text>
          </Flex>
        </Flex>

        <Flex maxWidth="930px">
          <Flex maxWidth="600px">
            <Text size="x4" strong>Personal Projects</Text>
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

        <Flex maxWidth="600px">
          <Text margin="x6" size="x4" strong>Writings</Text>

          { Object
              .values(data.writings)
              .sort((a, b) => b.date - a.date)
              .map((writing) => (
                <Writing { ...writing } key={ writing.title } />
              )) }
        </Flex>

        <Flex maxWidth="600px">
          <Text margin="x6" size="x4" strong>Experience</Text>

          { Object
              .values(data.experience)
              .sort((a, b) => b.date - a.date)
              .map((exp, index) => (
                <Experience { ...exp }
                    current={ index === 0 }
                    key={ exp.date } />
              )) }
        </Flex>
      </Flex>
    </Flex>
  );
};
