import { Box, Link, Text, TextProps } from 'preshape';

const startedYear = 2012;
const currentYear = new Date().getFullYear();

const Strong = (props: TextProps) => (
  <Text tag="strong" weight="x4" {...props} />
);

export default function AboutMe() {
  return (
    <Box flex="vertical" gap="x6">
      <Text size="x7">
        <Text tag="span">Hi, I'm </Text>
        <Text tag="span" weight="x5">
          Harry Hogg
        </Text>
        <Text tag="span">.</Text>
      </Text>

      <Text weight="x2">
        A <Strong>fullstack engineer</Strong>, with {currentYear - startedYear}{' '}
        years experience building software
      </Text>

      <Text>
        Now at <Strong>Figma</Strong>, the previous 3 years I was working at{' '}
        <Strong>Spotify</Strong>. Before that, for 7 years I was at{' '}
        <Strong>startups</Strong> in Brighton and London within various
        industries. Where I started, for 2 years I was shipping jQuery and PHP
        over FTP (it still counts).
      </Text>

      <Text>
        I've worked all parts of the stack; product, design and engineering.
        I've lead 5 <Strong>design system</Strong> projects,{' '}
        <Strong>Scala dataflow</Strong> pipelines, <Strong>Ruby/Rails</Strong>{' '}
        backends, a <Strong>Rust</Strong> network tiling search and renderer
        system, a <Strong>realtime collaborative</Strong> book editor,{' '}
        <Strong>GIS</Strong> infrastructure management, a{' '}
        <Strong>drag and drop</Strong> email editor, <Strong>WebGL</Strong>,{' '}
        <Strong>Canvas</Strong> and <Strong>SVG</Strong> infrastructure
        visualisations used by Netflix, internal{' '}
        <Strong>engineering platforms</Strong>, and the <Strong>desktop</Strong>{' '}
        application at Spotify.
      </Text>

      <Text>
        I published{' '}
        <Link href="https://www.mdpi.com/2073-8994/13/12/2376">
          something in a journal
        </Link>{' '}
        once.
      </Text>
    </Box>
  );
}
