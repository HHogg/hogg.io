import { Box, BoxProps, useMatchMedia } from 'preshape';
import ProjectPageHeader from './ProjectPageHeader';

type ProjectPageProps = BoxProps & {
  article: JSX.Element;
  presentation: JSX.Element;
};

export default function ProjectPageWithArticle({
  article,
  presentation,
  gap,
  ...rest
}: ProjectPageProps) {
  const match = useMatchMedia(['1000px']);
  const isSmall = !match('1000px');

  return (
    <Box {...rest} flex="horizontal" gap={gap}>
      <Box flex="vertical" basis="0" minWidth={0} grow gap={gap}>
        <ProjectPageHeader />

        {isSmall && (
          <Box flex="vertical" minHeight="600px">
            {presentation}
          </Box>
        )}

        <Box>{article}</Box>
      </Box>

      {!isSmall && (
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
