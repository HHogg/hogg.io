import { createMediaStyle } from '@hogg/common';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

export function render(url: string | Partial<Location>) {
  const helmetContext = {};
  const mediaStyle = createMediaStyle();

  const html = renderToString(
    <StaticRouter location={url}>
      <App helmetContext={helmetContext} />
    </StaticRouter>
  );

  return { html, helmetContext, mediaStyle };
}
