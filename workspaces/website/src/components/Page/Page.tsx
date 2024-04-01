import { Box, BoxProps, useMatchMedia } from 'preshape';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// TODO
const DEFAULT_IMAGE = '';

type PageProps = {
  description: string;
  image?: string;
  title: string;
};

export default function Page({
  children,
  description,
  gap = 'x16',
  image,
  title,
  ...rest
}: PropsWithChildren<PageProps & BoxProps>) {
  const location = useLocation();
  const match = useMatchMedia(['1000px']);

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>{title}</title>
        <meta property="og:site_name" content="Harrison Hogg Portfolio" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_GB" />
        <meta
          property="og:url"
          content={`https://hogg.io${location.pathname}`}
        />
        <meta property="og:image" content={image || DEFAULT_IMAGE} />
      </Helmet>

      <Box
        {...rest}
        flex="vertical"
        grow
        padding={match('1000px') ? 'x16' : 'x8'}
        maxWidth="1600px"
      >
        <Box flex="vertical" {...rest} gap={gap} grow>
          {children}
        </Box>
      </Box>
    </>
  );
}
