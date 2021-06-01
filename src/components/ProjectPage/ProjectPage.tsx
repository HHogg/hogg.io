import * as React from 'react';
import { Flex } from 'preshape';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  description: string;
  imageOG?: string;
  themeable?: boolean;
  title: string;
}

const ProjectPage: React.FC<Props> = (props) => {
  const {
    children,
    description,
    imageOG,
    themeable,
    title,
  } = props;

  return (
    <React.Fragment>
      <Metas
          description={ description }
          image={ imageOG }
          title={ title } />

      <Flex
          backgroundColor="background-shade-1"
          direction="vertical"
          gap="x6"
          grow
          padding="x6">
        <Flex>
          <Header
              description={ description }
              themeable={ themeable }
              title={ title } />
        </Flex>

        <Flex direction="vertical" grow>
          { children }
        </Flex>
      </Flex>
    </React.Fragment>
  );
};

export default ProjectPage;
