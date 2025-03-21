import { Box, BoxProps } from 'preshape';
import { PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import './Page.css';

// TODO
const DEFAULT_IMAGE = '';

type PageProps = {
  description: string;
  image?: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Page({
  children,
  description,
  gap = 'x16',
  image,
  title,
  createdAt,
  updatedAt,
  ...rest
}: PropsWithChildren<PageProps & BoxProps>) {
  const location = useLocation();

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

        {createdAt && (
          <meta property="og:article:published_time" content={createdAt} />
        )}

        {updatedAt && (
          <meta property="og:article:modified_time" content={updatedAt} />
        )}
      </Helmet>

      <Box {...rest} className="Page" flex="vertical" grow maxWidth="1600px">
        <Box flex="vertical" {...rest} gap={gap} grow>
          {children}
        </Box>
      </Box>
    </>
  );
}
