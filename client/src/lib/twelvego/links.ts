/**
 * 12Go Transport Affiliate Link Builder
 */
export function buildTransportLink(from: string, to: string): string {
  const base = "https://12go.asia/en/travel";
  return `${base}/${from.toLowerCase()}/${to.toLowerCase()}?z=14566451&sub_id=transport_api`;
}
