/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { launch } from 'puppeteer';
import sharp from 'sharp';
import tilings from '../results/output.json' assert { type: 'json' };

const outputDir = path.resolve('./results/images');

const generateTilingImage = async (page, notation, filePath) => {
  await page.goto(
    `http://localhost:4001/_tiling_generation?notation=${notation}`
  );

  const element = await page.waitForSelector('canvas', {
    timeout: 60_000,
  });

  if (!element) {
    throw new Error('Could not find canvas');
  }

  let data = await element.evaluate((canvas) => canvas.toDataURL());
  let rerenderAttempts = 0;

  while (data === 'data:,' || data === TRANSPARENT_IMAGE) {
    rerenderAttempts += 1;

    if (rerenderAttempts > 3) {
      console.log('Waiting for canvas to render...');
    }

    if (rerenderAttempts > 10) {
      throw new Error('Canvas did not render');
    }

    await new Promise((r) => setTimeout(r, 250));
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

  // Remove the directory if it exists
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Launch the browser and open a new blank page
  const browser = await launch({ headless: 'new' });
  const page = await browser.newPage();
  let tilingsCount = 0;

  await page.setViewport({ width: 1200, height: 600 });

  for (let i = 0; i < tilings.length; i++) {
    const { notation } = tilings[i];
    const filePath = path.join(
      outputDir,
      `${notation.replace(/\//g, ':')}.png`
    );

    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${notation} as it already exists`);
      continue;
    }

    await generateTilingImage(page, notation, filePath);
    tilingsCount++;
    console.log(`Saved ${notation} [${i + 1}/${tilings.length}]`);
  }

  await browser.close();

  console.log(`Generated ${tilingsCount} images`);
})();

const TRANSPARENT_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==';
