import { Box, Text, TextProps } from 'preshape';

const startedYear = 2012;
const currentYear = new Date().getFullYear();

const Strong = (props: TextProps) => (
  <Text tag="strong" weight="x4" {...props} />
);

export default function AboutMe() {
  return (
    <Box flex="vertical" gap="x3">
      <Text size="x6" weight="x5">
        <Text tag="span">Hi, I'm </Text>
        <Text tag="span">Harrison Hogg</Text>
        <Text tag="span">.</Text>
      </Text>

      <Text size="x6">
        A <Strong>fullstack engineer</Strong>, with {currentYear - startedYear}{' '}
        years experience building software
      </Text>

      <Text>
        The first 2 years was hacking jQuery and PHP over FTP (it still counts),
        the following 7 years were spent working at different startups in
        Brighton and London in various industries. The last ~3 years I've been
        working at <Strong>Spotify</Strong>.
      </Text>

      <Text>
        I've worked all parts of the stack, product, design and engineering.
        I've lead 5 <Strong>design system</Strong> projects,{' '}
        <Strong>Scala dataflow</Strong> pipelines, a <Strong>Rust</Strong>{' '}
        network euclidean tiling search and renderer, a{' '}
        <Strong>realtime collaborative</Strong> book editor,
        <Strong>GIS</Strong> infrastructure management, a{' '}
        <Strong>drag and drop</Strong> email editor, <Strong>WebGL</Strong>,{' '}
        <Strong>Canvas</Strong> and <Strong>SVG</Strong>{' '}
        <Strong>network visualisations</Strong> used by Netflix, internal{' '}
        <Strong>engineering platforms</Strong>, and the <Strong>desktop</Strong>{' '}
        application at Spotify.
      </Text>
    </Box>
  );
}
