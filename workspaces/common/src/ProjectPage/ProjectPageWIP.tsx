import { Box, BoxProps } from 'preshape';
import { useProjectPageContext } from '..';
import ProjectPageHeader from './ProjectPageHeader';

type ProjectPageWIPProps = BoxProps;

export default function ProjectPageWIP(props: ProjectPageWIPProps) {
  const {} = useProjectPageContext();

  return (
    <Box {...props} flex="vertical" grow maxWidth="800px">
      <ProjectPageHeader />
    </Box>
  );
}
