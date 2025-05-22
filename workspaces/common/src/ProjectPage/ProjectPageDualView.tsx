import { Box, BoxProps } from 'preshape';
import { ImageCover, Lines, useProjectPageContext } from '..';
import ProjectPageHeader from './ProjectPageHeader';

export type ProjectPageDualViewProps = BoxProps & {
  article: JSX.Element;
  layout: 'vertical' | 'horizontal';
  presentation: JSX.Element;
};

export default function ProjectPageDualView({
  article,
  layout,
  presentation,
  gap,
  ...rest
}: ProjectPageDualViewProps) {
  const { image } = useProjectPageContext();

  return (
    <Box {...rest} flex="horizontal" gap={gap}>
      <Box flex="vertical" basis="0" minWidth={0} grow gap={gap}>
        <ProjectPageHeader />

        {layout === 'horizontal' && (
          <Lines
            count={3}
            gap="x1"
            paddingOffsetLeft="x32"
            size={(index) => 3 - index}
            style={{ maxWidth: 400 }}
          />
        )}

        {layout === 'vertical' && (
          <Box flex="vertical" minHeight="600px">
            {presentation}
          </Box>
        )}

        <Box>
          <Box>{article}</Box>

          {image && (
            <ImageCover
              backgroundColor="text-shade-1"
              borderRadius="x2"
              borderSize="x1"
              borderColor="background-shade-4"
              height="200px"
              margin="x16"
              maxWidth="800px"
              src={image}
            />
          )}
        </Box>
      </Box>

      {layout === 'horizontal' && (
        <Box flex="vertical" basis="0" minWidth={0} grow>
          <Box
            flex="vertical"
            height={`calc(100vh - var(--size--x12) * 2)`}
            style={{ position: 'sticky', top: 'var(--size--x12)' }}
          >
            {presentation}
          </Box>
        </Box>
      )}
    </Box>
  );
}
