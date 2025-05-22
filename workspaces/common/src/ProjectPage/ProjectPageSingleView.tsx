import { Box, BoxProps } from 'preshape';
import { ImageCover, useProjectPageContext } from '..';
import ProjectPageHeader from './ProjectPageHeader';

type ProjectPageProps = Omit<BoxProps, 'content'> & {
  content: JSX.Element;
};

export default function ProjectPageSingleView({
  content,
  ...rest
}: ProjectPageProps) {
  const { image } = useProjectPageContext();

  return (
    <Box {...rest} flex="vertical" grow maxWidth="800px">
      <ProjectPageHeader />

      <Box flex="vertical" grow>
        {content}
      </Box>

      {image && (
        <ImageCover
          backgroundColor="text-shade-1"
          borderRadius="x2"
          borderSize="x1"
          borderColor="background-shade-4"
          height="200px"
          maxWidth="800px"
          src={image}
        />
      )}
    </Box>
  );
}
