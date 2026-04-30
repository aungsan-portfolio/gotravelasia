export interface AgodaLtCityMapEntry {
  city: string;
  country: string;
  agodaLtCityId: number;
  hotelCount: number;
  avgLatitude: number;
  avgLongitude: number;
}

export interface AgodaLtCityMatch extends AgodaLtCityMapEntry {
  source: "data_file_city_id";
}

const AGODA_LT_CITY_MAP: AgodaLtCityMapEntry[] = [
  { city: "Bangkok", country: "Thailand", agodaLtCityId: 9395, hotelCount: 1, avgLatitude: 13.7563, avgLongitude: 100.5018 },
  { city: "Da Nang", country: "Vietnam", agodaLtCityId: 16440, hotelCount: 1, avgLatitude: 16.0544, avgLongitude: 108.2022 },
  { city: "Singapore", country: "Singapore", agodaLtCityId: 4064, hotelCount: 1, avgLatitude: 1.3521, avgLongitude: 103.8198 },
  { city: "Hanoi", country: "Vietnam", agodaLtCityId: 2758, hotelCount: 1, avgLatitude: 21.0285, avgLongitude: 105.8542 },
  { city: "Ho Chi Minh City", country: "Vietnam", agodaLtCityId: 13170, hotelCount: 1, avgLatitude: 10.8231, avgLongitude: 106.6297 },
  { city: "Phuket", country: "Thailand", agodaLtCityId: 16056, hotelCount: 1, avgLatitude: 7.8804, avgLongitude: 98.3923 },
  { city: "Chiang Mai", country: "Thailand", agodaLtCityId: 7401, hotelCount: 1, avgLatitude: 18.7883, avgLongitude: 98.9853 },
  { city: "Bali", country: "Indonesia", agodaLtCityId: 17193, hotelCount: 1, avgLatitude: -8.3405, avgLongitude: 115.092 },
  { city: "Tokyo", country: "Japan", agodaLtCityId: 5085, hotelCount: 1, avgLatitude: 35.6762, avgLongitude: 139.6503 },
  { city: "Seoul", country: "South Korea", agodaLtCityId: 14690, hotelCount: 1, avgLatitude: 37.5665, avgLongitude: 126.978 },
  { city: "Dubai", country: "UAE", agodaLtCityId: 2994, hotelCount: 1, avgLatitude: 25.2048, avgLongitude: 55.2708 },
  { city: "London", country: "United Kingdom", agodaLtCityId: 233, hotelCount: 1, avgLatitude: 51.5072, avgLongitude: -0.1276 },
  { city: "Paris", country: "France", agodaLtCityId: 15470, hotelCount: 1, avgLatitude: 48.8566, avgLongitude: 2.3522 },
  { city: "Kuala Lumpur", country: "Malaysia", agodaLtCityId: 14524, hotelCount: 1, avgLatitude: 3.139, avgLongitude: 101.6869 },
  { city: "Hong Kong", country: "Hong Kong", agodaLtCityId: 16808, hotelCount: 1, avgLatitude: 22.3193, avgLongitude: 114.1694 },
  { city: "Taipei", country: "Taiwan", agodaLtCityId: 4951, hotelCount: 1, avgLatitude: 25.033, avgLongitude: 121.5654 },
  { city: "Osaka", country: "Japan", agodaLtCityId: 9590, hotelCount: 1, avgLatitude: 34.6937, avgLongitude: 135.5023 },
  { city: "Krabi", country: "Thailand", agodaLtCityId: 14865, hotelCount: 1, avgLatitude: 8.099, avgLongitude: 98.9862 },
  { city: "Yangon", country: "Myanmar", agodaLtCityId: 16599, hotelCount: 1, avgLatitude: 16.9074, avgLongitude: 96.1297 },
  { city: "Mandalay", country: "Myanmar", agodaLtCityId: 9299, hotelCount: 1, avgLatitude: 21.902, avgLongitude: 96.0842 },
  { city: "Manila", country: "Philippines", agodaLtCityId: 1622, hotelCount: 1, avgLatitude: 14.5995, avgLongitude: 120.9842 },
  { city: "Cebu", country: "Philippines", agodaLtCityId: 4001, hotelCount: 1, avgLatitude: 10.3157, avgLongitude: 123.8854 },
  { city: "Siem Reap", country: "Cambodia", agodaLtCityId: 16917, hotelCount: 1, avgLatitude: 13.3633, avgLongitude: 103.856 },
  { city: "Phnom Penh", country: "Cambodia", agodaLtCityId: 4816, hotelCount: 1, avgLatitude: 11.5564, avgLongitude: 104.9282 },
  { city: "New Delhi and NCR", country: "India", agodaLtCityId: 14552, hotelCount: 1, avgLatitude: 28.6139, avgLongitude: 77.209 },
  { city: "Shanghai", country: "China", agodaLtCityId: 3987, hotelCount: 1, avgLatitude: 31.2304, avgLongitude: 121.4737 },
  { city: "Beijing", country: "China", agodaLtCityId: 1569, hotelCount: 1, avgLatitude: 39.9042, avgLongitude: 116.4074 },
];

const normalize = (value: string | undefined): string =>
  (value ?? "").trim().toLowerCase();

const cityCountryIndex = new Map<string, AgodaLtCityMapEntry>();
const cityOnlyIndex = new Map<string, AgodaLtCityMapEntry>();

for (const entry of AGODA_LT_CITY_MAP) {
  const cityKey = normalize(entry.city);
  const countryKey = normalize(entry.country);
  cityCountryIndex.set(`${cityKey}|${countryKey}`, entry);
  if (!cityOnlyIndex.has(cityKey)) {
    cityOnlyIndex.set(cityKey, entry);
  }
}

export function findAgodaLtCityIdByName(
  cityName: string,
  country?: string
): AgodaLtCityMatch | undefined {
  const normalizedCity = normalize(cityName);
  if (!normalizedCity) return undefined;

  const normalizedCountry = normalize(country);
  const match = normalizedCountry
    ? cityCountryIndex.get(`${normalizedCity}|${normalizedCountry}`)
    : cityOnlyIndex.get(normalizedCity);

  if (!match) return undefined;
  return { ...match, source: "data_file_city_id" };
}
