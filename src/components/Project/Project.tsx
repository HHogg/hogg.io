import { Box, Image, Link, Text } from 'preshape';
import React, { HTMLProps } from 'react';
import { Project } from '../../types';

interface Props extends Project {}

const ProjectComponent = (props: Props & HTMLProps<HTMLAnchorElement>) => {
  const { description, href, image, title, to } = props;

  return (
    <Link
      flex="vertical"
      grow
      href={href}
      target={href ? title : undefined}
      to={to}
    >
      <Box
        borderColor="background-shade-3"
        borderRadius="x3"
        borderSize="x2"
        flex="vertical"
        grow
        overflow="hidden"
        padding="x2"
      >
        <Box
          borderRadius="x3"
          container
          height="180px"
          margin="x2"
          overflow="hidden"
        >
          <Image
            absolute="center"
            height="180px"
            maxWidth="600px"
            src={image}
            width="600px"
          />
        </Box>

        <Box
          alignChildrenVertical="end"
          backgroundColor="background-shade-2"
          borderRadius="x3"
          grow
          paddingHorizontal="x6"
          paddingVertical="x4"
        >
          <Text size="x4" strong>
            {title}
          </Text>
          <Text size="x3">{description}</Text>
        </Box>
      </Box>
    </Link>
  );
};

export default ProjectComponent;
