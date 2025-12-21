export async function fetchDCCSpatial(port) {
  try {
    const res = await fetch(
      `https://dcc-router.denverairportpickup.workers.dev/api/internal/${port}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("DCC unavailable");
    return await res.json();
  } catch (e) {
    console.warn("DCC fallback:", e.message);
    return null;
  }
}
