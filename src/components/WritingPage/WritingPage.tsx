import * as React from 'react';
import { Flex, Text } from 'preshape';
import { DateTime } from 'luxon';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props {
  date: number;
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

      <Flex direction="vertical" gap="x6" grow>
        <Flex
            backgroundColor="background-shade-1"
            direction="vertical"
            gap="x6"
            padding="x6"
            textColor="text-shade-1"
            theme="night">
          <Flex>
            <Header />
          </Flex>

          <Flex>
            <Flex maxWidth="600px" paddingVertical="x6">
              <Text heading margin="x2" size="x4" strong>{ title }</Text>
              <Text heading margin="x2" size="x2">{ description }</Text>
              <Text heading margin="x2" size="x1" strong>{ DateTime.fromMillis(date).toFormat('dd MMM yyyy') }</Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex backgroundColor="background-shade-1" grow padding="x6">
          <Flex>
            { children }
          </Flex>
        </Flex>
      </Flex>
    </React.Fragment>
  );
};

export default WritingPage;
