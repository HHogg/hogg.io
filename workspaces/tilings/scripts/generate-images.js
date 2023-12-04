/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { launch } from 'puppeteer';
import sharp from 'sharp';
import tilings from '../results/output.json' assert { type: 'json' };

const outputDir = path.resolve('./results/images');

const generateTilingImage = async (page, notation, filePath) => {
  await page.goto(`http://localhost:4001/tiling_generate/${notation}`);

  const element = await page.waitForSelector('canvas', {
    timeout: 60_000,
  });

  if (!element) {
    throw new Error('Could not find canvas');
  }

  let data = await element.evaluate((canvas) => canvas.toDataURL());

  while (data === 'data:,') {
    console.log('Waiting for canvas to render...');
    await new Promise((r) => setTimeout(r, 1000));
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
