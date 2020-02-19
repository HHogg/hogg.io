import * as React from 'react';
import { Flex } from 'preshape';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  description: string;
  imageOG: string;
  title: string;
}

const ProjectPage: React.FC<Props> = (props) => {
  const {
    children,
    description,
    imageOG,
    title,
  } = props;

  return (
    <React.Fragment>
      <Metas
          description={ description }
          image={ imageOG }
          title={ title } />

      <Flex direction="vertical" gap="x6" padding="x6">
        <Flex>
          <Header />
        </Flex>

        <Flex>
          { children }
        </Flex>
      </Flex>
    </React.Fragment>
  );
};

export default ProjectPage;
