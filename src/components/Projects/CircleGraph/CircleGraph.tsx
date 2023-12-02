import { Box, Link, Text } from 'preshape';
import data from '../../../data';
import ProjectPage from '../../ProjectPage/ProjectPage';
import IntersectionExplorer from '../IntersectionExplorer/IntersectionExplorer';
import { sampleCircles } from '../IntersectionExplorer/sampleCircles';
import useGraph from '../IntersectionExplorer/useGraph';

const CircleGraph = () => {
  const graphResult = useGraph(sampleCircles);

  return (
    <ProjectPage {...data.projects.CircleGraph}>
      <Box
        alignChildrenVertical="middle"
        flex="vertical"
        grow
        maxWidth="1400px"
        paddingVertical="x4"
      >
        <IntersectionExplorer {...graphResult} />
      </Box>

      <Box>
        <Text align="middle">
          This is a Circle Graph Intersection Explorer, please{' '}
          <Link to="/writings/circle-graphs" underline>
            see this article
          </Link>{' '}
          on how to use and interpret this visualisation.
        </Text>
      </Box>
    </ProjectPage>
  );
};

export default CircleGraph;
