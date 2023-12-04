import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { SSRRender as render } from '../../dist/server/entry-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => path.resolve(__dirname, p);
const template = fs.readFileSync(toAbsolute('dist/client/index.html'), 'utf-8');

const routesToPrerender = [
  '/',
];

// pre-render each route...
for (const url of routesToPrerender) {
  const appHtml = render(url);
  const html = template.replace(`<!--app-html-->`, appHtml);
  const filePath = toAbsolute(
    `dist/client${url === '/' ? '/index' : url}.html`
  );
  const fileDir = path.dirname(filePath);

  fs.mkdirSync(fileDir, { recursive: true });
  fs.writeFileSync(filePath, html);
}
