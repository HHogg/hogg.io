import groupBy from 'lodash/groupBy';
import uniqueTilings from '../../../results/output.json';

export type TilingResult = (typeof uniqueTilings)[number];

export const results = uniqueTilings;

export const getRandomNotation = (previous: string): string => {
  const randomResult = results[Math.floor(Math.random() * results.length)];
  return randomResult.notation === previous
    ? getRandomNotation(previous)
    : randomResult.notation;
};

export const groupResultsByUniform = (
  results: TilingResult[]
): Record<string, TilingResult[]> => groupBy(results, 'uniform');

const indexResultsBy = (key: keyof Pick<TilingResult, 'notation' | 'd_key'>) =>
  results.reduce<Record<string, TilingResult>>((acc, tiling) => {
    acc[tiling[key]] = tiling;
    return acc;
  }, {});

export const resultsByUniform = groupResultsByUniform(results);
export const resultsByNotation = indexResultsBy('notation');
export const resultsByUniqueKey = indexResultsBy('d_key');