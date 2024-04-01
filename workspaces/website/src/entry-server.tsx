import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function SSRRender(url: string | Partial<Location>) {
  const helmetContext = {};
  const html = renderToString(
    <StaticRouter location={url}>
      <App helmetContext={helmetContext} />
    </StaticRouter>
  );

  return { html, helmetContext };
}
