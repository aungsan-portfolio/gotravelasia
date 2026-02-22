export const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || "";

export const AFFILIATE = {
  AGODA_CID: "1959281",
  TRAVELPAYOUTS_MARKER: "697202",
  TWELVE_GO_REFERER: "14566451",
  KLOOK_AID: "111750",
  AIRALO_URL: "https://airalo.tpx.gr/rLWEywcV",
  TRIPCOM_ALLIANCE_ID: "7796167",
  TRIPCOM_SID: "293794502",
  TPWL_ID: "12942",
} as const;

export function buildAviasalesUrl(origin: string, dest: string, date?: string, options?: {
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
}) {
  const searchDate = date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  const params = new URLSearchParams({
    origin_iata: origin,
    destination_iata: dest,
    depart_date: searchDate,
    one_way: options?.returnDate ? "false" : "true",
    adults: String(options?.adults || 1),
    locale: "en",
    currency: "USD",
  });
  if (options?.returnDate) params.set("return_date", options.returnDate);
  if (options?.children) params.set("children", String(options.children));
  if (options?.infants) params.set("infants", String(options.infants));
  if (options?.cabinClass) params.set("trip_class", options.cabinClass);

  const targetUrl = `https://www.aviasales.com/search?${params.toString()}`;
  return `https://tp.media/r?marker=${AFFILIATE.TRAVELPAYOUTS_MARKER}&p=4114&u=${encodeURIComponent(targetUrl)}`;
}

export function buildAgodaCityUrl(citySlug: string, checkIn?: string, checkOut?: string) {
  let url = `https://www.agoda.com/city/${citySlug}.html?cid=${AFFILIATE.AGODA_CID}`;
  if (checkIn) url += `&checkIn=${checkIn}`;
  if (checkOut) url += `&checkout=${checkOut}`;
  return url;
}

export function buildAgodaPartnerUrl(cityId: number) {
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=${AFFILIATE.AGODA_CID}&city=${cityId}`;
}

export function build12GoUrl(route: string, subId = "homepage") {
  return `https://12go.asia/en/travel/${route}?referer=${AFFILIATE.TWELVE_GO_REFERER}&z=${AFFILIATE.TWELVE_GO_REFERER}&sub_id=${subId}`;
}

export function buildKlookUrl(path = "country/4-thailand-things-to-do/") {
  return `https://www.klook.com/en-US/${path}?aid=${AFFILIATE.KLOOK_AID}`;
}

export function buildTripComUrl(origin: string, dest: string, date: string, options?: {
  returnDate?: string;
  cabinClass?: string;
  adults?: number;
}) {
  const params = new URLSearchParams({
    locale: "en_US",
    dcity: origin,
    acity: dest,
    ddate: date,
    class: options?.cabinClass === "business" || options?.cabinClass === "first" ? "C" : "Y",
    quantity: String(options?.adults || 1),
    searchBoxArg: "t",
    Allianceid: AFFILIATE.TRIPCOM_ALLIANCE_ID,
    SID: AFFILIATE.TRIPCOM_SID,
  });
  if (options?.returnDate) params.set("rdate", options.returnDate);
  return `https://www.trip.com/flights?${params.toString()}`;
}
