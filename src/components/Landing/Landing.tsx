import { motion } from 'framer';
import { Box, Grid, Link, Text, Icon, useMatchMedia } from 'preshape';
import * as React from 'react';
import data, { experienceSorted, listedWritingsSorted } from '../../data';
import Experience from '../Experience/Experience';
import Header from '../Header/Header';
import Project from '../Project/Project';
import Writing from '../Writing/Writing';

export default function Landing() {
  const match = useMatchMedia(['1000px']);

  return (
    <Box backgroundColor="background-shade-1" padding="x6">
      <Header />

      <Box
          alignChildrenHorizontal="middle"
          flex="vertical"
          gap="x16">
        <Box maxWidth="600px" paddingVertical="x3">
          <Box margin="x6">
            <Text margin="x2" size="x7" strong>
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
            <Text margin="x2" size="x6" strong>I'm Harrison Hogg, a Software Engineer from Brighton, UK.</Text>
          </Box>

          <Box margin="x6">
            <Text margin="x3" size="x4">I love designing and building things, which frequently
              sends me down rabbit holes on side projects. I studied at <Link href="https://www.open.ac.uk/" underline>The Open University</Link> where
              I received my BSc Computing and Design Honours degree. When I'm not stringing characters together, I'm
              a less than stable climbing frame for my two daughters 👧🏼👩🏼.</Text>
          </Box>
        </Box>

        <Box maxWidth="1240px" paddingVertical="x3">
          <Box maxWidth="600px">
            <Text size="x5" strong>Personal Projects</Text>
            <Text margin="x2">Some of my favourite and finished personal side projects.</Text>
          </Box>

          <Grid
              gap="x4"
              margin="x6"
              repeatWidthMin="300px">
            { Object.values(data.projects).map((project) => (
              <Project { ...project } key={ project.title } />
            )) }
          </Grid>
        </Box>

        <Box
            flex={ match('1000px') ? 'horizontal' : 'vertical' }
            gap="x16"
            maxWidth="1240px"
            reverse={ !match('1000px') }>
          <Box basis="0" grow paddingVertical="x3" shrink>
            <Box margin="x10">
              <Text margin="x2" size="x5" strong>Experience</Text>
              <Text margin="x2">A timeline of where and what I've worked on over the years.</Text>
            </Box>

            { experienceSorted.map((exp, index) => (
              <Experience { ...exp }
                  current={ index === 0 }
                  key={ exp.date } />
            )) }
          </Box>

          <Box basis="0" grow paddingVertical="x3" shrink>
            <Box margin="x6">
              <Text margin="x2" size="x5" strong>Writings</Text>
              <Text margin="x2">
                Usually when doing one of my side projects, I find something to write about and then
                add them to this list. It's like an infrequent blog with no consistent theme.
              </Text>
            </Box>

            { listedWritingsSorted.map((writing) => (
              <Writing { ...writing } key={ writing.title } />
            )) }
          </Box>
        </Box>

        <Box
            alignChildrenHorizontal="middle"
            flex="horizontal"
            gap="x8"
            maxWidth="600px"
            paddingVertical="x8">
          <Box>
            <Link href="mailto:harry@hogg.io">
              <Icon name="Letter" size="2rem" />
            </Link>
          </Box>

          <Box>
            <Link href="https://github.com/HHogg" target="Github">
              <Icon name="Github" size="2rem" />
            </Link>
          </Box>

          <Box>
            <Link href="https://linkedin.com/in/harrison-hogg" target="LinkedIn">
              <Icon name="LinkedIn" size="2rem" />
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
