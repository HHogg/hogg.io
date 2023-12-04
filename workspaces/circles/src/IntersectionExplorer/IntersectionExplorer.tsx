import IntersectionExplorerProjectWindow from './IntersectionExplorerProjectWindow';
import IntersectionExplorerProvider, {
  IntersectionExplorerProviderProps,
} from './IntersectionExplorerProvider';

const IntersectionExplorer = (props: IntersectionExplorerProviderProps) => {
  return (
    <IntersectionExplorerProvider {...props}>
      <IntersectionExplorerProjectWindow />
    </IntersectionExplorerProvider>
  );
};

export default IntersectionExplorer;
