/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { launch } from 'puppeteer';
import sharp from 'sharp';
import tilings from '../results/output.json' assert { type: 'json' };

const TIMEOUT = 60_000;
const MAX_RENDER_ATTEMPTS = 20;

const outputDir = path.resolve('./results/images');
const toId = (notation) => notation.replace(/\//g, ':');

const generateTilingImage = async (page, notation, filePath) => {
  await page.goto(
    `http://127.0.0.1:8080/_tiling_generation?notation=${notation}`
  );

  const element = await page.waitForSelector('canvas', {
    timeout: TIMEOUT,
  });

  if (!element) {
    throw new Error('Could not find canvas');
  }

  let data = await element.evaluate((canvas) => canvas.toDataURL());
  let rerenderAttempts = 0;

  while (data === 'data:,' || data === TRANSPARENT_IMAGE) {
    rerenderAttempts += 1;

    if (rerenderAttempts % 5 === 0) {
      console.log('Waiting for canvas to render...');
    }

    if (rerenderAttempts > MAX_RENDER_ATTEMPTS) {
      throw new Error('Canvas did not render');
    }

    await new Promise((r) => setTimeout(r, TIMEOUT / MAX_RENDER_ATTEMPTS));
    data = await element.evaluate((canvas) => canvas.toDataURL());
  }

  const buffer = Buffer.from(
    data.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  await sharp(buffer).trim().toFile(filePath);
  await element.dispose();
};

(async () => {
  console.log('Starting puppeteer...');

  const fileNameMap = new Map();

  tilings.forEach((tiling) => {
    const { notation } = tiling;
    const id = toId(notation);
    fileNameMap.set(id, notation);
  });

  // If the diretory exists, remove the images
  // that aren't in the tilings list
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir);

    for (const file of files) {
      const id = path.basename(file, '.png');

      if (!fileNameMap.has(id)) {
        fs.rmSync(path.join(outputDir, file));
        console.log(`Removed ${file}`);
      }
    }
  }

  // Launch the browser and open a new blank page
  const browser = await launch({ headless: 'new' });
  const page = await browser.newPage();

  let tilingsCount = 0;
  let i = 0;

  await page.setViewport({ width: 1200, height: 600 });

  for (const [id, notation] of fileNameMap.entries()) {
    const filePath = path.join(outputDir, `${id}.png`);

    if (fs.existsSync(filePath)) {
      console.log(
        `[${++i}/${tilings.length}] Skipping ${notation} as it already exists`
      );
      continue;
    }

    await generateTilingImage(page, notation, filePath);
    tilingsCount++;
    console.log(`[${++i}/${tilings.length}] Saved ${notation}`);
  }

  await browser.close();

  console.log(`Generated ${tilingsCount} images`);
})();

const TRANSPARENT_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==';
