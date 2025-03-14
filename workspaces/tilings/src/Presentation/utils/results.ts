import groupBy from 'lodash/groupBy';
import uniqueTilings from '../../../results/output.json';

export type ImageModule = { default: string };

export const results = uniqueTilings;
export type OutputResult = (typeof results)[number];

export const getRandomNotation = (previous?: string): string => {
  const randomResult = results[Math.floor(Math.random() * results.length)];
  return randomResult.notation === previous
    ? getRandomNotation(previous)
    : randomResult.notation;
};

export const groupResults = (
  results: OutputResult[]
): Record<string, OutputResult[]> =>
  groupBy(results, (r) => r.notation.split('/')[0].split('-')[0]);

const indexResultsBy = (key: keyof Pick<OutputResult, 'notation'>) =>
  results.reduce<Record<string, OutputResult>>((acc, tiling) => {
    acc[tiling[key]] = tiling;
    return acc;
  }, {});

export const resultsByUniform = groupResults(results);
export const resultsByNotation = indexResultsBy('notation');

export const resultsImages: Record<string, string> = {};

Object.entries(
  import.meta.glob('../../../results/images/*.png', {
    eager: true,
    query: '?url',
  })
).forEach(([key, value]) => {
  const filename = key.split('/').pop()!;
  const notation = filename.replace('.png', '').replace(/:/g, '/');

  resultsImages[notation] = (value as ImageModule).default;
});
