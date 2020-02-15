import * as React from 'react';
import { motion } from 'framer';
import { Flex, Grid, Link, Text } from 'preshape';
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
            <Text size="x3" strong>Personal Projects</Text>
          </Flex>

          <Grid
              gap="x4"
              margin="x4"
              repeatWidthMin="300px">
            <Project
                description="A web application for creating artwork by filling
                  in the intersection areas of overlapping circles. Using an
                  experiemental way of calculating intersections areas with
                  computational geometry."
                href="https://circles.hogg.io"
                image={ require('../../assets/circles.svg') }
                target="Circles"
                title="Circles" />

            <Project
                description="A web application for visualisating the GomJau-Hogg
                  notation for generating any regular polygon tesselations."
                href="https://antwerp.hogg.io"
                image={ require('../../assets/antwerp.svg') }
                target="Antwerp"
                title="Antwerp" />

            <Project
                description="A minimal design system and library of React components,
                that fit together just like LEGO. This exists mainly to facilitate
                my own personal projects."
                href="https://preshape.hogg.io"
                image={ require('../../assets/preshape.svg') }
                target="Preshape"
                title="Preshape" />

            <Project
                description="Snake Heuristics is a game for developers to write a
                  heuristic function, to play the perfect classic game of snake. This
                  was created for a workshop at the AsyncJS meetup."
                href="https://snake.hogg.io"
                image={ require('../../assets/snake.svg') }
                target="Snake"
                title="Snake" />

            <Project
                description="An experiment for rendering and animating a variety of
                  spirals and radial patterns using WebGL."
                image={ require('../../assets/spiral.png') }
                title="Spirals"
                to="/projects/spirals" />
          </Grid>
        </Flex>

        <Flex maxWidth="600px">
          <Text margin="x4" size="x3" strong>Writings</Text>

          <Writing
              date={ 1580428800000 }
              description="An explanation of the GomJau-Hogg’s notation for generating all of
                the regular, semiregular (uniform) and demigular (k-uniform, up to at least k=3) in a consistent,
                unique and unequivocal manner."
              title="GomJau-Hogg’s notation for automatic generation of k-uniform tessellations"
              to="/writings/generating-tessellations" />

          <Writing
              date={ 1534460400000 }
              description="An experiment into calculating all of the regions of intersecting circles
                using a computational geometric algorithm."
              title="Identifying the areas of intersecting circles with computational geometry"
              to="/writings/circle-intersections" />
        </Flex>

        <Flex maxWidth="600px">
          <Text margin="x4" size="x3" strong>Experience</Text>

          <Experience
              company="Pure360"
              date={ 1396306800000 }
              description="Pure360 is an Email Service Provider (ESP) offering a
                Software-as-a-service platform that allows businesses to manage their
                subscribers, create emails and track campaigns. My time at Pure360
                as a UI Developer was primarily focused on building the UI to their
                Drag and Drop email creation tool and helped build the platform
                for campaign management and tracking."
              labels={ ['javascript', 'nodejs', 'scala', 'angular', 'less'] }
              role="UI Developer" />

          <Experience
              company="Reedsy"
              date={ 1427842800000 }
              description="Reedsy is a curated marketplace for self publishing authors.
                They provide a platform to handle connections, communication and
                payments between authors and professionals, and a suite of tools
                to write and publish books. My time at Reedsy was spent building the
                marketplace to connect book publishing professionals, the collaborative
                book editing application (using Operational Transformation), and the Pattern
                Library to implement the design system across these two application."
              labels={ ['javascript', 'nodejs', 'ruby', 'angular', 'sass'] }
              role="Senior Developer" />

          <Experience
              company="Brandwatch"
              date={ 1446336000000 }
              description="Brandwatch is a social media monitoring platform.
                They provide tools to monitor, analyse and engage
                with conversations across the internet. My time at Brandwatch was
                spent building the frontend to the Audiences
                product, leading the development of Axiom (the company's Pattern Library
                and Design System) and helping out with various development projects."
              labels={ ['javascript', 'nodejs', 'css', 'react', 'redux'] }
              role="Senior Developer" />

          <Experience
              company="Bitrise & Outlyer (Acquisition)"
              date={ 1538348400000 }
              description="Bitrise is a continuous integration and delivery platform
                built for mobile. Automating iOS and Android builds, testing and deployment.
                My time and Bitrise is focused on building the Trace add-on frontend and
                React Pattern Library."
              labels={ ['typescript', 'css', 'react', 'redux'] }
              present
              role="Software Engineer" />
        </Flex>
      </Flex>
    </Flex>
  );
};
