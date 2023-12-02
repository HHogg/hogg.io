import { Box, Text } from 'preshape';
import GraphVisualisation from './GraphVisualisation/GraphVisualisation';
import IntersectionExplorerProvider, {
  IntersectionExplorerProviderProps,
} from './IntersectionExplorerProvider';
import NodeList from './NodeList/NodeList';
import TraversalList from './TraversalList/TraversalList';
import './IntersectionExplorer.css';

const IntersectionExplorer = (props: IntersectionExplorerProviderProps) => {
  return (
    <IntersectionExplorerProvider {...props}>
      <Box>
        <Text margin="x4" size="x5" weight="x2">
          Nodes & Edges
        </Text>

        <NodeList />
      </Box>

      <Box alignChildrenVertical="start" flex="vertical" grow="2" padding="x8">
        <GraphVisualisation />
      </Box>

      <Box>
        <Text margin="x4" size="x5" weight="x2">
          Traversals
        </Text>

        <TraversalList />
      </Box>
    </IntersectionExplorerProvider>
  );
};

export default IntersectionExplorer;
