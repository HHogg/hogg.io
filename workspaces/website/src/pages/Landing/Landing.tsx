import { Box, useMatchMedia } from 'preshape';
// import AsciiTagGrid from '../../components/AsciiTagGrid/AsciiTagGrid';
import Header from '../../components/Header/Header';
import Page from '../../components/Page/Page';
import AboutMe from './AboutMe';
import Me from './Me/Me';
import ProjectCards from './Projects/ProjectCards';
import SectionTitle from './SectionTitle';
import Timeline from './Timeline/Timeline';

export default function Landing() {
  const match = useMatchMedia(['1000px']);

  return (
    <Page
      title="Harrison Hogg"
      description="Harrison Hogg's portfolio website, showcases experience, projects and placements"
      gap={match('1000px') ? 'x32' : 'x16'}
    >
      <Header alignChildrenVertical="middle">
        <Me size={140} />
      </Header>

      <Box flex="horizontal">
        <Box basis="0" grow style={{ maxWidth: 800 }}>
          <AboutMe />
        </Box>

        {/* <Box basis="0" grow>
          <AsciiTagGrid />
        </Box> */}
      </Box>

      <Box flex="vertical" gap={match('1000px') ? 'x12' : 'x6'}>
        <SectionTitle maxWidthTop={800} title="Prjcts ////" />
        <ProjectCards />
      </Box>

      <Box flex="vertical" gap={match('1000px') ? 'x12' : 'x6'}>
        <SectionTitle
          maxWidthTop={1200}
          maxWidthBottom={600}
          title="Plcemnts {!!}"
        />
        <Timeline style={{ maxWidth: 640 }} />
      </Box>
    </Page>
  );
}
