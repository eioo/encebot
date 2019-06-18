import * as dateFormat from 'dateformat';

export function log(message?: any, ...optionalParams: any[]) {
  const time = dateFormat(new Date(), 'HH:MM:ss');
  console.log(time, message, ...optionalParams);
}

export function timestamp(date: number | Date): string {
  return dateFormat(new Date(date), 'dd.mm. HH:MM');
}
