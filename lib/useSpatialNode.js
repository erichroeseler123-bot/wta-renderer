export async function useSpatialNode(nodeId) {
  const res = await fetch(
    `https://dcc-router.denverairportpickup.workers.dev/api/node/${nodeId}`
  );
  return res.json();
}
