import { Box, Icon, Label, Labels, Link, Separator, Text, useMatchMedia } from 'preshape';
import * as React from 'react';
import data from '../../data';
import { Writing } from '../../Types';
import { fromISO } from '../../utils/date';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props extends Writing {}

const listedWritings = Object
  .keys(data.writings)
  .filter((key) => !data.writings[key].unlisted);

const WritingPage: React.FC<Props> = (props) => {
  const { children, date, description, id, imageOG, tags, title } = props;
  const index = listedWritings.indexOf(id);
  const previous = listedWritings[index - 1];
  const next = listedWritings[index + 1];

  const match = useMatchMedia(['600px']);

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
              <Text heading margin="x2" size="x6" strong tag="h1">{ title }</Text>
              <Text heading margin="x2" size="x4" tag="h2">{ description }</Text>
              <Text aria-label="article date" heading margin="x2" size="x2">{ fromISO(date) }</Text>
            </Box>
          </Box>
        </Box>

        <Box backgroundColor="background-shade-1" grow padding="x6">
          <Box>
            { children }
          </Box>

          <Box margin="x16" maxWidth="600px">
            <Separator borderColor="background-shade-3" margin="x4" />
            <Text margin="x2" size="x2" strong tag="h1">{ title }</Text>
            <Text margin="x2" size="x1" tag="h2">{ description }</Text>
            <Text aria-label="article date" margin="x2" size="x1">{ fromISO(date) }</Text>

            <Labels margin="x4">
              { tags.map((tag) => (
                <Label key={ tag }>{ tag }</Label>
              )) }
            </Labels>
            <Separator borderColor="background-shade-3" margin="x4" />
          </Box>

          <Box paddingVertical="x4" />
        </Box>
      </Box>

      <Box
          alignChildrenHorizontal="between"
          backgroundColor="background-shade-1"
          flex={ match('600px') ? 'horizontal' : 'vertical' }
          gap="x6"
          padding="x6"
          textColor="text-shade-1"
          theme="night">
        { previous ? (
          <Link
              alignChildrenVertical="middle"
              flex="horizontal"
              gap="x3"
              maxWidth={ match('600px') ? '33%' : undefined }
              padding="x6"
              to={ data.writings[previous].to }>
            <Icon name="ChevronLeft" size="2rem" />

            <Box shrink>
              <Text margin="x2" size="x2" strong tag="h1">{ data.writings[previous].title }</Text>
              <Text margin="x2" size="x1" tag="h2">{ data.writings[previous].description }</Text>
            </Box>
          </Link>
        ) : <Box /> }

        { next ? (
          <Link
              alignChildrenVertical="middle"
              flex="horizontal"
              gap="x3"
              maxWidth={ match('600px') ? '33%' : undefined }
              padding="x6"
              to={ data.writings[next].to }>
            <Box shrink>
              <Text margin="x2" size="x2" strong tag="h1">{ data.writings[next].title }</Text>
              <Text margin="x2" size="x1" tag="h2">{ data.writings[next].description }</Text>
            </Box>

            <Icon name="ChevronRight" size="2rem" />
          </Link>
        ) : <Box /> }
      </Box>
    </React.Fragment>
  );
};

export default WritingPage;
