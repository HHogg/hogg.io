import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import Root from './components/Root';

export function SSRRender(url: string | Partial<Location>) {
  return renderToString(
    <StaticRouter location={url}>
      <HelmetProvider>
        <Root />
      </HelmetProvider>
    </StaticRouter>
  );
}
