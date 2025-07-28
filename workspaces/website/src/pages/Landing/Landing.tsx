import { Media } from '@hogg/common';
import { Box } from 'preshape';
// import AsciiTagGrid from '../../components/AsciiTagGrid/AsciiTagGrid';
import Header from '../../components/Header/Header';
import Page from '../../components/Page/Page';
import AboutMe from './AboutMe';
import Me from './Me/Me';
import ProjectCards from './Projects/ProjectCards';
import SectionTitle from './SectionTitle';
import Timeline from './Timeline/Timeline';

export default function Landing() {
  return (
    <Page
      title="Harrison Hogg"
      description="Harrison Hogg's portfolio website, showcases experience, projects and placements"
      gap="x24"
    >
      <Header alignChildrenVertical="middle">
        <Media greaterThanOrEqual="desktop">
          <Me size={140} />
        </Media>
      </Header>

      <Box flex="horizontal">
        <Box basis="0" grow style={{ maxWidth: 600 }}>
          <AboutMe />
        </Box>

        {/* <Box basis="0" grow>
          <AsciiTagGrid />
        </Box> */}
      </Box>

      <Box flex="vertical" gap="x12">
        <SectionTitle maxWidthTop={800} title="Projects" />
        <ProjectCards />
      </Box>

      <Box flex="vertical" gap="x12">
        <SectionTitle
          maxWidthTop={1200}
          maxWidthBottom={600}
          title="Placements"
        />
        <Timeline style={{ maxWidth: 640 }} />
      </Box>
    </Page>
  );
}
