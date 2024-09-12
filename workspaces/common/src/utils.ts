import { DateTime } from 'luxon';
import { Project } from './types';

export function getProjectRoutePath(project: Project): string {
  return `/projects/${project.id}`;
}

export function formateDate(date: string): string {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
}

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
) {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;

  return (value: number) => {
    return (
      rangeMin +
      ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin)
    );
  };
}

export function extendPointFromOrigin(
  px: number,
  py: number,
  ox: number,
  oy: number,
  scalar: number
): [number, number] {
  let vx = px - ox;
  let vy = py - oy;

  const magnitude = Math.sqrt(vx * vx + vy * vy) || 1;

  vx = vx / magnitude;
  vy = vy / magnitude;

  return [vx * scalar, vy * scalar];
}
