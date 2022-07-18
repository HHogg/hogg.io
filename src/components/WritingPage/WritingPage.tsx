import {
  Box,
  Icons,
  Label,
  Labels,
  Link,
  Separator,
  Text,
  useMatchMedia,
} from 'preshape';
import React, { PropsWithChildren } from 'react';
import { listedWritingsSorted } from '../../data';
import { Writing } from '../../types';
import { fromISO } from '../../utils/date';
import Header from '../Header/Header';
import Metas from '../Metas/Metas';

interface Props extends Writing {}

const WritingPage = (props: PropsWithChildren<Props>) => {
  const { children, date, description, id, imageOG, tags, title } = props;
  const index = listedWritingsSorted.findIndex((writing) => writing.id === id);
  const previous = listedWritingsSorted[index - 1];
  const next = listedWritingsSorted[index + 1];

  const match = useMatchMedia(['600px']);

  return (
    <>
      <Metas description={description} image={imageOG} title={title} />

      <Box flex="vertical" gap="x6" grow tag="article">
        <Box
          backgroundColor="background-shade-1"
          borderRadius="x3"
          flex="vertical"
          gap="x6"
          padding="x6"
          textColor="text-shade-1"
          theme="night"
        >
          <Box>
            <Header />
          </Box>

          <Box>
            <Box maxWidth="600px" paddingVertical="x6">
              <Text heading margin="x2" size="x7" strong tag="h1">
                {title}
              </Text>
              <Text heading margin="x2" size="x5" tag="h2">
                {description}
              </Text>
              <Text aria-label="article date" heading margin="x2" size="x3">
                {fromISO(date)}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box
          backgroundColor="background-shade-1"
          borderRadius="x3"
          grow
          padding="x6"
        >
          <Box>{children}</Box>

          <Box margin="x16" maxWidth="600px">
            <Separator borderColor="background-shade-3" margin="x4" />
            <Text margin="x2" size="x3" strong tag="h1">
              {title}
            </Text>
            <Text margin="x2" size="x2" tag="h2">
              {description}
            </Text>
            <Text aria-label="article date" margin="x2" size="x2">
              {fromISO(date)}
            </Text>

            <Labels margin="x4">
              {tags.map((tag) => (
                <Label key={tag}>{tag}</Label>
              ))}
            </Labels>
            <Separator borderColor="background-shade-3" margin="x4" />
          </Box>

          <Box paddingVertical="x4" />
        </Box>
      </Box>

      <Box
        alignChildrenHorizontal="between"
        backgroundColor="background-shade-1"
        flex={match('600px') ? 'horizontal' : 'vertical'}
        gap="x6"
        padding="x6"
        textColor="text-shade-1"
        theme="night"
      >
        {previous ? (
          <Link
            alignChildrenVertical="middle"
            flex="horizontal"
            gap="x3"
            maxWidth={match('600px') ? '33%' : undefined}
            padding="x6"
            to={previous.to}
          >
            <Icons.ChevronLeft size="2rem" />

            <Box shrink>
              <Text margin="x2" size="x3" strong tag="h1">
                {previous.title}
              </Text>
              <Text margin="x2" size="x2" tag="h2">
                {previous.description}
              </Text>
            </Box>
          </Link>
        ) : (
          <Box />
        )}

        {next ? (
          <Link
            alignChildrenVertical="middle"
            flex="horizontal"
            gap="x3"
            maxWidth={match('600px') ? '33%' : undefined}
            padding="x6"
            to={next.to}
          >
            <Box shrink>
              <Text margin="x2" size="x3" strong tag="h1">
                {next.title}
              </Text>
              <Text margin="x2" size="x2" tag="h2">
                {next.description}
              </Text>
            </Box>

            <Icons.ChevronRight size="2rem" />
          </Link>
        ) : (
          <Box />
        )}
      </Box>
    </>
  );
};

export default WritingPage;
