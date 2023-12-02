import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface Props {
  description: string;
  image?: string;
  title?: string;
}

const Metas = (props: Props) => {
  const { description, image, title } = props;
  const location = useLocation();

  const urlContent = `https://hogg.io${location.pathname}`;
  const imageContent = `https://hogg.io${image}`;

  return (
    <Helmet>
      <title>{title ? `${title} | ` : ''}Harrison Hogg</title>
      <meta content="Harrison Hogg" property="og:site_name" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content="website" property="og:type" />
      <meta content="en_GB" property="og:locale" />
      <meta content={urlContent} property="og:url" />
      {image && <meta content={imageContent} property="og:image" />}
    </Helmet>
  );
};

export default Metas;
