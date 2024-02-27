import { Box, BoxProps } from 'preshape';
import ProjectPageHeader from './ProjectPageHeader';

type ProjectPageProps = Omit<BoxProps, 'content'> & {
  content: JSX.Element;
};

export default function ProjectPageSingleView({
  content,
  ...rest
}: ProjectPageProps) {
  return (
    <Box {...rest} flex="vertical" grow maxWidth="800px">
      <ProjectPageHeader />

      <Box flex="vertical" grow>
        {content}
      </Box>
    </Box>
  );
}
