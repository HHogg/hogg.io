import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { render } from './dist/server/entry-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);
const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8');

const routesToPrerender = [
  '/',
  '/projects/circle-intersections',
  '/projects/circle-art',
  '/projects/snake',
  '/projects/spirals',
  '/projects/tilings',
  '/projects/circular-sequence',
  '/projects/line-segment-extending',
];

// pre-render each route...
for (const url of routesToPrerender) {
  const { html: htmlContent, helmetContext, mediaStyle } = render(url);
  const metaContent = helmetContext.helmet.priority.toString();

  const contents = template
    .replace(`<!--media-style-->`, `<style>${mediaStyle}</style>`)
    .replace(`<!--meta-tags-->`, metaContent)
    .replace(`<!--app-html-->`, htmlContent);

  const filePath = toAbsolute(
    `dist/client${url === '/' ? '/index' : url}.html`
  );
  const fileDir = path.dirname(filePath);

  fs.mkdirSync(fileDir, { recursive: true });
  fs.writeFileSync(filePath, contents);
}
