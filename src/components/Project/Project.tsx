import * as React from 'react';
import { Appear, Flex, Image, Link, LinkProps, Text } from 'preshape';

interface Props extends LinkProps {
  description: string;
  href?: string;
  image: string;
  title: string;
  to?: string;
}

const Project = (props: Props & React.HTMLProps<HTMLAnchorElement>) => {
  const { description, image, title, ...rest } = props;
  const [isOver, setIsOver] = React.useState(false);

  return (
    <Link { ...rest } display="block">
      <Flex
          borderColor="text-shade-1"
          borderSize="x2"
          container
          onPointerOver={ () => setIsOver(true) }
          onPointerLeave={ () => setIsOver(false) }>
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
            textColor="light-shade-1"
            visible={ isOver }>
          <Text margin="x2" strong>{ title }</Text>
          <Text size="x1">{ description }</Text>
        </Appear>
      </Flex>
    </Link>
  );
};

export default Project;
