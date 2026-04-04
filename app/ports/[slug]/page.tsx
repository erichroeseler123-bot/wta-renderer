import { redirect } from "next/navigation";

export default async function PortPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearch)) {
    if (typeof value === "string" && value) qs.set(key, value);
  }

  if (slug && !qs.get("port")) qs.set("port", slug);
  if (!qs.get("intent")) qs.set("intent", "best-for");
  if (!qs.get("topic")) qs.set("topic", "shore-excursions");

  redirect("/plan?" + qs.toString());
}
