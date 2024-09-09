import groupBy from 'lodash/groupBy';
import uniqueTilings from '../../../results/output.json';
import { Result } from '../../types';

export type ImageModule = { default: string };

export const results = uniqueTilings as Result[];

export const getRandomNotation = (previous: string): string => {
  const randomResult = results[Math.floor(Math.random() * results.length)];
  return randomResult.notation === previous
    ? getRandomNotation(previous)
    : randomResult.notation;
};

export const groupResultsByUniform = (
  results: Result[]
): Record<string, Result[]> => groupBy(results, 'uniform');

const indexResultsBy = (key: keyof Pick<Result, 'notation'>) =>
  results.reduce<Record<string, Result>>((acc, tiling) => {
    acc[tiling[key]] = tiling;
    return acc;
  }, {});

export const resultsByUniform = groupResultsByUniform(results);
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
