import { DateTime } from 'luxon';

export const fromISO = (date: string) =>
  DateTime.fromISO(date).toFormat('dd MMM yyyy');
