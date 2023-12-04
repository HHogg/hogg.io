import { Box, BoxProps, Label } from 'preshape';
import ProjectPageHeader from './ProjectPageHeader';

type ProjectPageProps = BoxProps & {
  presentation: JSX.Element;
};

export default function ProjectPageWithoutArticle({
  presentation,
  ...rest
}: ProjectPageProps) {
  return (
    <Box {...rest} flex="vertical" grow>
      <ProjectPageHeader style={{ maxWidth: 800 }} />

      <Box flex="vertical" grow minHeight="600px">
        {presentation}
      </Box>
    </Box>
  );
}
