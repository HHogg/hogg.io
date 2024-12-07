import { Duration } from 'luxon';

type FormatDurationOptions = {
  limitedPrecision: boolean;
};

export function formatDuration(
  durationMs: number,
  { limitedPrecision }: FormatDurationOptions = { limitedPrecision: false }
): string {
  let duration = Duration.fromMillis(durationMs).rescale();

  if (limitedPrecision) {
    if (duration.as('seconds') >= 1) {
      duration = duration.set({ milliseconds: 0 });
    }

    if (duration.as('hours') >= 1) {
      duration = duration.set({ seconds: 0 });
    }

    if (duration.as('days') >= 1) {
      duration = duration.set({ minutes: 0 });
    }

    if (duration.as('weeks') >= 1) {
      duration = duration.set({ hours: 0 });
    }

    if (duration.as('months') >= 1) {
      duration = duration.set({ days: 0 });
    }

    if (duration.as('years') >= 1) {
      duration = duration.set({ weeks: 0 });
    }
  }

  return duration.rescale().normalize().toHuman({
    compactDisplay: 'short',
    listStyle: 'narrow',
    unitDisplay: 'narrow',
  });
}

export function formatMs(durationMs: number): string {
  return Duration.fromMillis(durationMs).normalize().toHuman({
    compactDisplay: 'short',
    listStyle: 'narrow',
    unitDisplay: 'narrow',
  });
}

export function formatNumber(value?: number): string {
  return value === undefined
    ? '-'
    : new Intl.NumberFormat('en-uk').format(value);
}

const ordinalOnes = [
  'zeroth',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
  'sixteenth',
  'seventeenth',
  'eighteenth',
  'nineteenth',
];
const ordinalTens = [
  'twent',
  'thirt',
  'fort',
  'fift',
  'sixt',
  'sevent',
  'eight',
  'ninet',
];

export function formatOrdinal(value: number): string {
  if (value < 20) return ordinalOnes[value];
  if (value % 10 === 0) return ordinalTens[Math.floor(value / 10) - 2] + 'ieth';
  return (
    ordinalTens[Math.floor(value / 10) - 2] + 'y-' + ordinalOnes[value % 10]
  );
}

export function formatPercent(number?: number) {
  return number === undefined ? '' : `${(number * 100).toFixed(1)}%`;
}

export function titlecase(value: string): string {
  return value
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function radiansToDegrees(radians: number): number {
  return Math.round(radians * (180 / Math.PI));
}

export function formatFacetValue(key: string, value: string) {
  if (key === 'uniform') return formatUniform(value);
  if (key === 'validity') return formatValidity(value);

  return titlecase(value);
}

export function formatUniform(value: number | string): string {
  if (value.toString() === '0') return 'Regular';
  if (value.toString() === '1') return 'Semi-Regular';

  return `${value}-Uniform`;
}

export function formatValidity(value: string): string {
  if (value === 'true') return 'Invalid';
  if (value === 'false') return 'Valid';

  throw new Error(`Unexpected validity value: ${value}`);
}
