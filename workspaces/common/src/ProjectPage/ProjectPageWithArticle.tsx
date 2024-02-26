import { Box, BoxProps } from 'preshape';
import ProjectPageHeader from './ProjectPageHeader';

export type ProjectPageWithArticleProps = BoxProps & {
  article: JSX.Element;
  layout: 'vertical' | 'horizontal';
  presentation: JSX.Element;
};

export default function ProjectPageWithArticle({
  article,
  layout,
  presentation,
  gap,
  ...rest
}: ProjectPageWithArticleProps) {
  return (
    <Box {...rest} flex="horizontal" gap={gap}>
      <Box flex="vertical" basis="0" minWidth={0} grow gap={gap}>
        <ProjectPageHeader />

        {layout === 'vertical' && (
          <Box flex="vertical" minHeight="600px">
            {presentation}
          </Box>
        )}

        <Box>{article}</Box>
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
