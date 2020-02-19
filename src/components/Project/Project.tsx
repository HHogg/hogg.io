import * as React from 'react';
import { Appear, Flex, Image, Link, Text } from 'preshape';
import { Project } from '../../Types';

interface Props extends Project {}

const ProjectComponent = (props: Props & React.HTMLProps<HTMLAnchorElement>) => {
  const { description, href, image, title, to } = props;
  const [isOver, setIsOver] = React.useState(false);

  return (
    <Link
        display="block"
        href={ href }
        target={ href ? title : undefined }
        to={ to }>
      <Flex
          borderColor="text-shade-1"
          borderSize="x2"
          container
          onPointerLeave={ () => setIsOver(false) }
          onPointerOver={ () => setIsOver(true) }>
        <Flex container height="180px" overflow="hidden">
          <Image
              absolute="center"
              height="180px"
              maxWidth="600px"
              src={ image }
              width="600px" />
        </Flex>

        <Appear
            absolute="fullscreen"
            alignChildrenVertical="end"
            animation="Fade"
            backgroundColor="accent-shade-2"
            direction="vertical"
            padding="x6"
            textColor="white"
            visible={ isOver }>
          <Flex>
            <Text margin="x2" strong>{ title }</Text>
            <Text size="x1">{ description }</Text>
          </Flex>
        </Appear>
      </Flex>
    </Link>
  );
};

export default ProjectComponent;
