import * as React from 'react';
import { Flex } from 'preshape';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  description: string;
  image: string;
  title: string;
}

const ProjectPage: React.FC<Props> = (props) => {
  const {
    children,
    description,
    image,
    title,
  } = props;

  return (
    <React.Fragment>
      <Metas
          description={ description }
          image={ image }
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
