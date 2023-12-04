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
      <Helmet>
        <title>{title}</title>
        <meta content="HHogg Portfolio" property="og:site_name" />
        <meta content={title} property="og:title" />
        <meta content={description} property="og:description" />
        <meta content="website" property="og:type" />
        <meta content="en_GB" property="og:locale" />
        <meta
          content={`https://hogg.io${location.pathname}`}
          property="og:url"
        />
        <meta content={image || DEFAULT_IMAGE} property="og:image" />
      </Helmet>

      <Box
        {...rest}
        flex="vertical"
        grow
        padding={match('1000px') ? 'x16' : 'x8'}
        maxWidth="1600px"
        textColor="text-shade-1"
      >
        <Box flex="vertical" {...rest} gap={gap} grow>
          {children}
        </Box>
      </Box>
    </>
  );
}
