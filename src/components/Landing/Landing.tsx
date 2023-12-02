import { GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react';
import { Box, Grid, Link, Motion, Text, useMatchMedia } from 'preshape';
import data, {
  experienceSorted,
  listedWritingsSorted,
  publicationsSorted,
} from '../../data';
import Experience from '../Experience/Experience';
import Header from '../Header/Header';
import Project from '../Project/Project';
import Publication from '../Publication/Publication';
import Writing from '../Writing/Writing';

export default function Landing() {
  const match = useMatchMedia(['1000px']);

  return (
    <Box backgroundColor="background-shade-1" borderRadius="x3" padding="x6">
      <Header />

      <Box alignChildrenHorizontal="middle" flex="vertical" gap="x16">
        <Box maxWidth="600px" paddingVertical="x3">
          <Box margin="x6">
            <Text margin="x2" size="x8" weight="x2">
              Hi.{' '}
              <Motion
                animate={{
                  rotate: [
                    '0deg',
                    '25deg',
                    '0deg',
                    '25deg',
                    '0deg',
                    '25deg',
                    '0deg',
                  ],
                }}
                initial={{ rotate: '0deg' }}
                style={{ display: 'inline-block' }}
                transition={{
                  delay: 2,
                  ease: 'easeInOut',
                  loop: Infinity,
                  repeatDelay: 5,
                }}
              >
                👋
              </Motion>
            </Text>
            <Text margin="x2" size="x7" weight="x2">
              I'm Harrison Hogg, a Software Engineer from Brighton, UK.
            </Text>
          </Box>

          <Box margin="x6">
            <Text margin="x3" size="x5">
              I love designing and building things, which frequently sends me
              down rabbit holes on side projects. I studied at{' '}
              <Link href="https://www.open.ac.uk/" underline>
                The Open University
              </Link>{' '}
              where I received my BSc Computing and Design Honours degree. When
              I'm not stringing characters together, I'm a less than stable
              climbing frame for my two daughters 👧🏼👩🏼.
            </Text>
          </Box>
        </Box>

        <Box maxWidth="1240px" paddingVertical="x3">
          <Box maxWidth="600px">
            <Text size="x6" weight="x2">
              Personal Projects
            </Text>
          </Box>

          <Grid gap="x4" margin="x6" repeatWidthMin="300px">
            {Object.values(data.projects).map((project) => (
              <Project {...project} key={project.title} />
            ))}
          </Grid>
        </Box>

        <Box
          flex={match('1000px') ? 'horizontal' : 'vertical'}
          gap="x16"
          maxWidth="1240px"
          reverse={!match('1000px')}
        >
          <Box basis="0" grow paddingVertical="x3" shrink>
            <Box margin="x10">
              <Text margin="x2" size="x6" weight="x2">
                Experience
              </Text>
            </Box>

            {experienceSorted.map((exp, index) => (
              <Experience {...exp} current={index === 0} key={exp.date} />
            ))}
          </Box>

          <Box basis="0" grow paddingVertical="x3" shrink>
            <Box margin="x16">
              <Box margin="x6">
                <Text margin="x2" size="x6" weight="x2">
                  Writings
                </Text>
              </Box>

              {listedWritingsSorted.map((writing) => (
                <Writing {...writing} key={writing.title} />
              ))}
            </Box>

            <Box margin="x16">
              <Box margin="x6">
                <Text margin="x2" size="x6" weight="x2">
                  Publications
                </Text>
              </Box>

              {publicationsSorted.map((publication) => (
                <Publication {...publication} key={publication.title} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          alignChildrenHorizontal="middle"
          flex="horizontal"
          gap="x8"
          maxWidth="600px"
          paddingVertical="x8"
        >
          <Box>
            <Link href="mailto:harry@hogg.io">
              <MailIcon size="2rem" />
            </Link>
          </Box>

          <Box>
            <Link href="https://github.com/HHogg" target="Github">
              <GithubIcon size="2rem" />
            </Link>
          </Box>

          <Box>
            <Link
              href="https://linkedin.com/in/harrison-hogg"
              target="LinkedIn"
            >
              <LinkedinIcon size="2rem" />
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
