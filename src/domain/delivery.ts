/** Business-day arithmetic in UTC. Weekends are skipped; public holidays are not modelled. */
export function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date;
}

export interface DeliveryWindow {
  earliest: Date;
  latest: Date;
}

export function deliveryWindow(from: Date, [min, max]: [number, number]): DeliveryWindow {
  return { earliest: addBusinessDays(from, min), latest: addBusinessDays(from, max) };
}

export function formatDay(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(date);
}

export function formatWindow(window: DeliveryWindow, locale: string): string {
  const a = formatDay(window.earliest, locale);
  const b = formatDay(window.latest, locale);
  return a === b ? a : `${a} - ${b}`;
}
