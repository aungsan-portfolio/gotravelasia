/**
 * client/src/lib/cities.ts
 * =========================
 * Single source of truth — 44 cities
 * Flights (iata) + Hotels (agodaCityId, bookingName) + 12Go (name)
 */

export interface City {
  iata:          string;       // Flight code
  slug:          string;       // URL slug
  name:          string;       // English display name
  nameMM:        string;       // Myanmar name
  country:       string;
  cc:            string;       // ISO country code
  flag:          string;
  agodaCityId:   number;       // Agoda hotel search
  bookingName:   string;       // Booking.com search term
  twelveGoName:  string;       // 12Go city name
  lat:           number;
  lng:           number;
  hub:           boolean;      // Major hub city
  hasHotels:     boolean;      // Hotel search eligible
}

export const CITIES: City[] = [
  // ─── 🇲🇲 Myanmar ──────────────────────────────────────────────
  { iata:'RGN', slug:'yangon',        name:'Yangon',        nameMM:'ရန်ကုန်',            country:'Myanmar',      cc:'MM', flag:'🇲🇲', agodaCityId:4611,  bookingName:'Yangon',               twelveGoName:'Yangon',        lat:16.9074, lng:96.1297,  hub:true,  hasHotels:true  },
  { iata:'MDL', slug:'mandalay',      name:'Mandalay',      nameMM:'မန္တလေး',           country:'Myanmar',      cc:'MM', flag:'🇲🇲', agodaCityId:4612,  bookingName:'Mandalay',             twelveGoName:'Mandalay',      lat:21.9020, lng:96.0842,  hub:false, hasHotels:true  },
  // ─── 🇹🇭 Thailand ─────────────────────────────────────────────
  { iata:'BKK', slug:'bangkok',       name:'Bangkok',       nameMM:'ဘန်ကောက်',           country:'Thailand',     cc:'TH', flag:'🇹🇭', agodaCityId:18056, bookingName:'Bangkok',              twelveGoName:'Bangkok',       lat:13.7563, lng:100.5018, hub:true,  hasHotels:true  },
  { iata:'CNX', slug:'chiang-mai',    name:'Chiang Mai',    nameMM:'ချင်းမိုင်',        country:'Thailand',     cc:'TH', flag:'🇹🇭', agodaCityId:3458,  bookingName:'Chiang Mai',           twelveGoName:'Chiang Mai',    lat:18.7883, lng:98.9853,  hub:false, hasHotels:true  },
  { iata:'HKT', slug:'phuket',        name:'Phuket',        nameMM:'ဖူးခက်',             country:'Thailand',     cc:'TH', flag:'🇹🇭', agodaCityId:5533,  bookingName:'Phuket',               twelveGoName:'Phuket',        lat:7.8804,  lng:98.3923,  hub:false, hasHotels:true  },
  { iata:'DMK', slug:'bangkok-dmk',   name:'Bangkok DMK',   nameMM:'ဘန်ကောက်-ဒွန်မောင်း', country:'Thailand',  cc:'TH', flag:'🇹🇭', agodaCityId:18056, bookingName:'Bangkok',              twelveGoName:'Bangkok',       lat:13.9126, lng:100.6068, hub:false, hasHotels:false },
  { iata:'KBV', slug:'krabi',         name:'Krabi',         nameMM:'ကရာဘီ',              country:'Thailand',     cc:'TH', flag:'🇹🇭', agodaCityId:8939,  bookingName:'Krabi',                twelveGoName:'Krabi',         lat:8.0990,  lng:98.9862,  hub:false, hasHotels:true  },
  // ─── 🇨🇳 China ────────────────────────────────────────────────
  { iata:'BJS', slug:'beijing',       name:'Beijing',       nameMM:'ပေကျင်း',            country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:3085,  bookingName:'Beijing',              twelveGoName:'Beijing',       lat:39.9042, lng:116.4074, hub:true,  hasHotels:true  },
  { iata:'SHA', slug:'shanghai',      name:'Shanghai',      nameMM:'ရှန်ဟိုင်း',        country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:6882,  bookingName:'Shanghai',             twelveGoName:'Shanghai',      lat:31.2304, lng:121.4737, hub:true,  hasHotels:true  },
  { iata:'CAN', slug:'guangzhou',     name:'Guangzhou',     nameMM:'ကွမ်ကျိုး',         country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:3374,  bookingName:'Guangzhou',            twelveGoName:'Guangzhou',     lat:23.1291, lng:113.2644, hub:false, hasHotels:true  },
  { iata:'KMG', slug:'kunming',       name:'Kunming',       nameMM:'ကူမင်း',             country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:3686,  bookingName:'Kunming',              twelveGoName:'Kunming',       lat:24.8801, lng:102.8329, hub:false, hasHotels:true  },
  { iata:'CSX', slug:'changsha',      name:'Changsha',      nameMM:'ချန်ရှာ',            country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:11516, bookingName:'Changsha',             twelveGoName:'Changsha',      lat:28.2278, lng:112.9388, hub:false, hasHotels:true  },
  { iata:'CKG', slug:'chongqing',     name:'Chongqing',     nameMM:'ချုံကင်း',           country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:3243,  bookingName:'Chongqing',            twelveGoName:'Chongqing',     lat:29.5630, lng:106.5516, hub:false, hasHotels:true  },
  { iata:'CTU', slug:'chengdu',       name:'Chengdu',       nameMM:'ချန်ဒူး',            country:'China',        cc:'CN', flag:'🇨🇳', agodaCityId:3227,  bookingName:'Chengdu',              twelveGoName:'Chengdu',       lat:30.5728, lng:104.0668, hub:false, hasHotels:true  },
  // ─── 🇮🇳 India ────────────────────────────────────────────────
  { iata:'CCU', slug:'kolkata',       name:'Kolkata',       nameMM:'ကာလ်ကတ္တား',        country:'India',        cc:'IN', flag:'🇮🇳', agodaCityId:3499,  bookingName:'Kolkata',              twelveGoName:'Kolkata',       lat:22.5726, lng:88.3639,  hub:false, hasHotels:true  },
  { iata:'DEL', slug:'delhi',         name:'Delhi',         nameMM:'ဒေလီ',               country:'India',        cc:'IN', flag:'🇮🇳', agodaCityId:1479,  bookingName:'New Delhi',            twelveGoName:'Delhi',         lat:28.6139, lng:77.2090,  hub:true,  hasHotels:true  },
  { iata:'MAA', slug:'chennai',       name:'Chennai',       nameMM:'ချန်နိုင်း',         country:'India',        cc:'IN', flag:'🇮🇳', agodaCityId:3383,  bookingName:'Chennai',              twelveGoName:'Chennai',       lat:13.0827, lng:80.2707,  hub:false, hasHotels:true  },
  { iata:'GAY', slug:'gaya',          name:'Gaya',          nameMM:'ဂါယာ',               country:'India',        cc:'IN', flag:'🇮🇳', agodaCityId:47898, bookingName:'Gaya',                 twelveGoName:'Gaya',          lat:24.7496, lng:85.0077,  hub:false, hasHotels:true  },
  // ─── 🇰🇷 South Korea ──────────────────────────────────────────
  { iata:'SEL', slug:'seoul',         name:'Seoul',         nameMM:'ဆိုးလ်',             country:'South Korea',  cc:'KR', flag:'🇰🇷', agodaCityId:6682,  bookingName:'Seoul',                twelveGoName:'Seoul',         lat:37.5665, lng:126.9780, hub:true,  hasHotels:true  },
  { iata:'PUS', slug:'busan',         name:'Busan',         nameMM:'ဘူဆန်',              country:'South Korea',  cc:'KR', flag:'🇰🇷', agodaCityId:6745,  bookingName:'Busan',                twelveGoName:'Busan',         lat:35.1796, lng:129.0756, hub:false, hasHotels:true  },
  { iata:'CJU', slug:'jeju',          name:'Jeju',          nameMM:'ဂျယ်ဂျူး',          country:'South Korea',  cc:'KR', flag:'🇰🇷', agodaCityId:6788,  bookingName:'Jeju City',            twelveGoName:'Jeju',          lat:33.4996, lng:126.5312, hub:false, hasHotels:true  },
  // ─── 🇯🇵 Japan ────────────────────────────────────────────────
  { iata:'TYO', slug:'tokyo',         name:'Tokyo',         nameMM:'တိုကျို',            country:'Japan',        cc:'JP', flag:'🇯🇵', agodaCityId:17277, bookingName:'Tokyo',                twelveGoName:'Tokyo',         lat:35.6762, lng:139.6503, hub:true,  hasHotels:true  },
  { iata:'OSA', slug:'osaka',         name:'Osaka',         nameMM:'အိုဆာကာ',            country:'Japan',        cc:'JP', flag:'🇯🇵', agodaCityId:8752,  bookingName:'Osaka',                twelveGoName:'Osaka',         lat:34.6937, lng:135.5023, hub:false, hasHotels:true  },
  // ─── 🇲🇾 Malaysia ─────────────────────────────────────────────
  { iata:'KUL', slug:'kuala-lumpur',  name:'Kuala Lumpur',  nameMM:'ကွာလာလမ်ပူ',        country:'Malaysia',     cc:'MY', flag:'🇲🇾', agodaCityId:3714,  bookingName:'Kuala Lumpur',         twelveGoName:'Kuala Lumpur',  lat:3.1390,  lng:101.6869, hub:true,  hasHotels:true  },
  { iata:'BKI', slug:'kota-kinabalu', name:'Kota Kinabalu', nameMM:'ကိုတာကင်နာဘာလူ',   country:'Malaysia',     cc:'MY', flag:'🇲🇾', agodaCityId:3719,  bookingName:'Kota Kinabalu',        twelveGoName:'Kota Kinabalu', lat:5.9804,  lng:116.0735, hub:false, hasHotels:true  },
  { iata:'PEN', slug:'penang',        name:'Penang',        nameMM:'ပီနန်း',             country:'Malaysia',     cc:'MY', flag:'🇲🇾', agodaCityId:3717,  bookingName:'Penang',               twelveGoName:'Penang',        lat:5.4141,  lng:100.3288, hub:false, hasHotels:true  },
  // ─── 🇻🇳 Vietnam ──────────────────────────────────────────────
  { iata:'DAD', slug:'da-nang',       name:'Da Nang',       nameMM:'ဒါနန်း',             country:'Vietnam',      cc:'VN', flag:'🇻🇳', agodaCityId:3386,  bookingName:'Da Nang',              twelveGoName:'Da Nang',       lat:16.0544, lng:108.2022, hub:false, hasHotels:true  },
  { iata:'SGN', slug:'ho-chi-minh',   name:'Ho Chi Minh',   nameMM:'ဟိုချီမင်း',         country:'Vietnam',      cc:'VN', flag:'🇻🇳', agodaCityId:1349,  bookingName:'Ho Chi Minh City',     twelveGoName:'Ho Chi Minh City', lat:10.8231, lng:106.6297, hub:true, hasHotels:true },
  { iata:'HAN', slug:'hanoi',         name:'Hanoi',         nameMM:'ဟနွိုင်း',           country:'Vietnam',      cc:'VN', flag:'🇻🇳', agodaCityId:2516,  bookingName:'Hanoi',                twelveGoName:'Hanoi',         lat:21.0285, lng:105.8542, hub:false, hasHotels:true  },
  // ─── 🇮🇩 Indonesia ────────────────────────────────────────────
  { iata:'DPS', slug:'bali',          name:'Bali',          nameMM:'ဘာလီ',               country:'Indonesia',    cc:'ID', flag:'🇮🇩', agodaCityId:2553,  bookingName:'Bali',                 twelveGoName:'Bali',          lat:-8.3405, lng:115.0920, hub:false, hasHotels:true  },
  { iata:'JKT', slug:'jakarta',       name:'Jakarta',       nameMM:'ဂျကာတာ',             country:'Indonesia',    cc:'ID', flag:'🇮🇩', agodaCityId:3393,  bookingName:'Jakarta',              twelveGoName:'Jakarta',       lat:-6.2088, lng:106.8456, hub:false, hasHotels:true  },
  // ─── 🇰🇭 Cambodia ─────────────────────────────────────────────
  { iata:'SAI', slug:'siem-reap',     name:'Siem Reap',     nameMM:'စီယမ်ရိ',            country:'Cambodia',     cc:'KH', flag:'🇰🇭', agodaCityId:3271,  bookingName:'Siem Reap',            twelveGoName:'Siem Reap',     lat:13.3633, lng:103.8560, hub:false, hasHotels:true  },
  { iata:'PNH', slug:'phnom-penh',    name:'Phnom Penh',    nameMM:'ဖနွမ်းပင်',          country:'Cambodia',     cc:'KH', flag:'🇰🇭', agodaCityId:3272,  bookingName:'Phnom Penh',           twelveGoName:'Phnom Penh',    lat:11.5564, lng:104.9282, hub:false, hasHotels:true  },
  // ─── 🇵🇭 Philippines ──────────────────────────────────────────
  { iata:'MNL', slug:'manila',        name:'Manila',        nameMM:'မနီလာ',              country:'Philippines',  cc:'PH', flag:'🇵🇭', agodaCityId:3878,  bookingName:'Manila',               twelveGoName:'Manila',        lat:14.5995, lng:120.9842, hub:true,  hasHotels:true  },
  { iata:'CEB', slug:'cebu',          name:'Cebu',          nameMM:'ဆီဘူး',              country:'Philippines',  cc:'PH', flag:'🇵🇭', agodaCityId:3879,  bookingName:'Cebu City',            twelveGoName:'Cebu',          lat:10.3157, lng:123.8854, hub:false, hasHotels:true  },
  // ─── Singles ──────────────────────────────────────────────────
  { iata:'SIN', slug:'singapore',     name:'Singapore',     nameMM:'စင်ကာပူ',            country:'Singapore',    cc:'SG', flag:'🇸🇬', agodaCityId:10307, bookingName:'Singapore',            twelveGoName:'Singapore',     lat:1.3521,  lng:103.8198, hub:true,  hasHotels:true  },
  { iata:'TPE', slug:'taipei',        name:'Taipei',        nameMM:'တိုင်ပေ',            country:'Taiwan',       cc:'TW', flag:'🇹🇼', agodaCityId:2427,  bookingName:'Taipei',               twelveGoName:'Taipei',        lat:25.0330, lng:121.5654, hub:false, hasHotels:true  },
  { iata:'HKG', slug:'hong-kong',     name:'Hong Kong',     nameMM:'ဟောင်ကောင်',         country:'Hong Kong',    cc:'HK', flag:'🇭🇰', agodaCityId:2515,  bookingName:'Hong Kong',            twelveGoName:'Hong Kong',     lat:22.3193, lng:114.1694, hub:false, hasHotels:true  },
  { iata:'MFM', slug:'macau',         name:'Macau',         nameMM:'မကာအို',             country:'Macau',        cc:'MO', flag:'🇲🇴', agodaCityId:2609,  bookingName:'Macau',                twelveGoName:'Macau',         lat:22.1987, lng:113.5439, hub:false, hasHotels:true  },
  { iata:'LPQ', slug:'luang-prabang', name:'Luang Prabang', nameMM:'လာအို',              country:'Laos',         cc:'LA', flag:'🇱🇦', agodaCityId:2594,  bookingName:'Luang Prabang',        twelveGoName:'Luang Prabang', lat:19.8845, lng:102.1348, hub:false, hasHotels:true  },
  { iata:'DXB', slug:'dubai',         name:'Dubai',         nameMM:'ဒူဘိုင်း',           country:'UAE',          cc:'AE', flag:'🇦🇪', agodaCityId:11867, bookingName:'Dubai',                twelveGoName:'Dubai',         lat:25.2048, lng:55.2708,  hub:false, hasHotels:true  },
  { iata:'BWN', slug:'brunei',        name:'Brunei',        nameMM:'ဘရူနိုင်း',          country:'Brunei',       cc:'BN', flag:'🇧🇳', agodaCityId:3155,  bookingName:'Bandar Seri Begawan',  twelveGoName:'Brunei',        lat:4.9031,  lng:114.9398, hub:false, hasHotels:true  },
];

// ── O(1) Lookups ─────────────────────────────────────────────────
export const cityBySlug  = new Map(CITIES.map(c => [c.slug, c]));
export const cityByIata  = new Map(CITIES.map(c => [c.iata, c]));
export const cityByAgoda = new Map(CITIES.filter(c => c.agodaCityId).map(c => [c.agodaCityId, c]));

export const getCityBySlug  = (slug: string): City | undefined => cityBySlug.get(slug);
export const getCityByIata  = (iata: string): City | undefined => cityByIata.get(iata.toUpperCase());
export const getHotelCities = (): City[] => CITIES.filter(c => c.hasHotels);
export const getHubCities   = (): City[] => CITIES.filter(c => c.hub);

/** Cities grouped by country — for UI dropdown optgroups */
export const CITIES_BY_COUNTRY = CITIES.reduce<
  Record<string, { flag: string; cc: string; cities: City[] }>
>((acc, city) => {
  if (!acc[city.country]) acc[city.country] = { flag: city.flag, cc: city.cc, cities: [] };
  acc[city.country].cities.push(city);
  return acc;
}, {});

/** Hotel-eligible cities sorted: hub first, Myanmar second, then alpha */
export const HOTEL_CITIES_SORTED = getHotelCities().sort((a, b) => {
  if (a.hub !== b.hub)           return b.hub ? 1 : -1;
  if (a.cc === 'MM' && b.cc !== 'MM') return -1;
  if (b.cc === 'MM' && a.cc !== 'MM') return  1;
  return a.name.localeCompare(b.name);
});
