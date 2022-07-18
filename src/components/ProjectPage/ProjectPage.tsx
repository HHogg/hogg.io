import { Box } from 'preshape';
import React, { PropsWithChildren } from 'react';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  description: string;
  imageOG?: string;
  themeable?: boolean;
  title: string;
}

const ProjectPage = (props: PropsWithChildren<Props>) => {
  const { children, description, imageOG, themeable, title } = props;

  return (
    <>
      <Metas description={description} image={imageOG} title={title} />

      <Box
        backgroundColor="background-shade-1"
        borderRadius="x3"
        flex="vertical"
        gap="x6"
        grow
        padding="x6"
      >
        <Box>
          <Header
            description={description}
            themeable={themeable}
            title={title}
          />
        </Box>

        <Box flex="vertical" grow>
          {children}
        </Box>
      </Box>
    </>
  );
};

export default ProjectPage;
