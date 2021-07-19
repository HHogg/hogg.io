import * as React from 'react';
import { Box, Image, Link, Text } from 'preshape';
import { Project } from '../../Types';

interface Props extends Project {}

const ProjectComponent = (props: Props & React.HTMLProps<HTMLAnchorElement>) => {
  const { description, href, image, title, to } = props;

  return (
    <Link
        flex="vertical"
        grow
        href={ href }
        target={ href ? title : undefined }
        to={ to }>
      <Box
          borderColor="background-shade-2"
          borderSize="x2"
          flex="vertical"
          grow>
        <Box container height="180px" overflow="hidden">
          <Image
              absolute="center"
              height="180px"
              maxWidth="600px"
              src={ image }
              width="600px" />
        </Box>

        <Box
            alignChildrenVertical="end"
            backgroundColor="background-shade-2"
            grow
            paddingHorizontal="x6"
            paddingVertical="x4">
          <Text size="x2" strong>{ title }</Text>
          <Text size="x1">{ description }</Text>
        </Box>
      </Box>
    </Link>
  );
};

export default ProjectComponent;
