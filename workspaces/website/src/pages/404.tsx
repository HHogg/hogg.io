/* eslint-disable no-irregular-whitespace */
import { ArrowLeft } from 'lucide-react';
import { Box, Link, Text } from 'preshape';
import Header from '../components/Header/Header';
import Page from '../components/Page/Page';
import PageBackButton from '../components/Page/PageBackButton';
import Me from './Landing/Me/Me';

export default function Page404() {
  return (
    <Page title="404" description="Page not found">
      <Header alignChildrenVertical="middle">
        <PageBackButton title="Home" path="/" />
      </Header>

      <Box alignChildren="middle" flex="vertical" gap="x8" grow>
        <Box container overflow="hidden">
          <Me size={140} />
          <Text
            absolute="bottom"
            monospace
            weight="x2"
            textColor="light-shade-1"
            style={{
              fontSize: '80px',
              top: 0,
              opacity: 1,
              mixBlendMode: 'exclusion',
            }}
          >
            {`4 4`}
          </Text>
        </Box>

        <Box maxWidth="300px">
          <Text align="middle" monospace size="x6" weight="x2" margin="x2">
            Page not found
          </Text>

          <Text align="middle" monospace size="x5">
            The page you are looking for does not exist
          </Text>

          <Text
            align="middle"
            alignChildren="middle"
            flex="horizontal"
            monospace
            size="x5"
            uppercase
            margin="x12"
          >
            <Link alignChildren="middle" flex="horizontal" gap="x2" to="/">
              <ArrowLeft />
              <Text>Back home</Text>
            </Link>
          </Text>
        </Box>
      </Box>
    </Page>
  );
}
