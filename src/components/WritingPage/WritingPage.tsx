import * as React from 'react';
import { Box, Text } from 'preshape';
import { fromISO } from '../../utils/date';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  date: string;
  description: string;
  imageOG: string;
  title: string;
}

const WritingPage: React.FC<Props> = (props) => {
  const { children, date, description, imageOG, title } = props;

  return (
    <React.Fragment>
      <Metas
          description={ description }
          image={ imageOG }
          title={ title } />

      <Box flex="vertical" gap="x6" grow tag="article">
        <Box
            backgroundColor="background-shade-1"
            flex="vertical"
            gap="x6"
            padding="x6"
            textColor="text-shade-1"
            theme="night">
          <Box>
            <Header />
          </Box>

          <Box>
            <Box maxWidth="600px" paddingVertical="x6">
              <Text heading margin="x2" size="x5" strong tag="h1">{ title }</Text>
              <Text heading margin="x2" size="x3" tag="h2">{ description }</Text>
              <Text aria-label="article date" heading margin="x2" size="x1">{ fromISO(date) }</Text>
            </Box>
          </Box>
        </Box>

        <Box backgroundColor="background-shade-1" grow padding="x6">
          <Box>
            { children }
          </Box>

          <Box paddingVertical="x16" />
        </Box>
      </Box>
    </React.Fragment>
  );
};

export default WritingPage;
