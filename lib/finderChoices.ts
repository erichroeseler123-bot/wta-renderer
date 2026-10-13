export type FinderSearchParams = Record<string, string | string[] | undefined>;
export type FinderChoices = { port: string; topic: string; date: string };

const PORTS = ["juneau", "skagway", "ketchikan"];
const STYLES = [
  "best-overall", "wildlife-whales", "glaciers", "flightseeing", "dog-sledding",
  "fishing", "adventure", "easy-day", "private-premium",
];

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

function validDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : "";
}

export function readFinderChoices(params: FinderSearchParams = {}): FinderChoices {
  const port = first(params.port).toLowerCase();
  const topic = first(params.topic).toLowerCase();
  return {
    port: PORTS.includes(port) ? port : "juneau",
    topic: STYLES.includes(topic) ? topic : "best-overall",
    date: validDate(first(params.date)),
  };
}

export function finderReturnHref(params: FinderSearchParams): string {
  const choices = readFinderChoices(params);
  const query = new URLSearchParams({ port: choices.port, topic: choices.topic });
  if (choices.date) query.set("date", choices.date);
  return `/?${query.toString()}#find-your-port-day`;
}
