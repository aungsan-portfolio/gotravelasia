// shared/destination/registry.ts

export type AirportSeed = {
  city: string;
  code: string;
  airport: string;
  country: string;
  flag: string;
};

export type RouteMetricsSeed = {
  priceRatio: number;
  avgFlightHours: number;
  avgTempC: number;
  avgRainMm: number;
};

export type DestinationSeed = AirportSeed &
  RouteMetricsSeed & {
    slug: string;
    aliases?: string[];
    isPopularDestination?: boolean;
    isPopularCity?: boolean;
    climate?: string;
    highlights?: string[];
    type?: "country" | "city" | "airport";
  };

export const DESTINATION_SEEDS: DestinationSeed[] = [
  // ... (I will copy the seeds from destinationRegistry.ts)
  { slug:"singapore", city:"Singapore", code:"SIN", airport:"Changi Airport", country:"Singapore", flag:"🇸🇬", priceRatio:1.0, avgFlightHours:2.4, avgTempC:27, avgRainMm:190, aliases:["sin", "singapo", "sg", "singapore-country"], isPopularDestination:true, type: "country" },
  { slug:"brunei", city:"Brunei", code:"BWN", airport:"Brunei Intl Airport", country:"Brunei", flag:"🇧🇳", priceRatio:1.3, avgFlightHours:3.2, avgTempC:27, avgRainMm:230, aliases:["bandar-seri-begawan","bwn","brunei-darussalam"], isPopularDestination:true, type: "country" },
  { slug:"cambodia", city:"Cambodia", code:"PNH", airport:"Phnom Penh Intl Airport", country:"Cambodia", flag:"🇰🇭", priceRatio:0.85, avgFlightHours:1.2, avgTempC:28, avgRainMm:150, aliases:["pnh","kh"], isPopularDestination:true, type: "country" },
  { slug:"china", city: "China", code: "PEK", airport: "Beijing Capital Intl", country: "China", flag: "🇨🇳", priceRatio: 1.8, avgFlightHours: 5.0, avgTempC: 13, avgRainMm: 60, aliases: ["cn","prc","mainland-china"], isPopularDestination: true, type: "country" },
  { slug:"hong-kong", city:"Hong Kong", code:"HKG", airport:"Hong Kong Intl Airport", country:"Hong Kong", flag:"🇭🇰", priceRatio:1.5, avgFlightHours:2.8, avgTempC:23, avgRainMm:180, aliases:["hkg","hk","hongkong","hong-kong-country"], isPopularDestination:true, type: "country" },
  { slug:"india", city:"India", code:"BOM", airport:"Chhatrapati Shivaji Intl", country:"India", flag:"🇮🇳", priceRatio:1.6, avgFlightHours:4.5, avgTempC:28, avgRainMm:200, aliases:["bom","in","bharat"], isPopularDestination:true, type: "country" },
  { slug:"indonesia", city:"Indonesia", code:"CGK", airport:"Soekarno-Hatta Intl", country:"Indonesia", flag:"🇮🇩", priceRatio:1.1, avgFlightHours:3.5, avgTempC:27, avgRainMm:175, aliases:["cgk","id"], isPopularDestination:true, type: "country" },
  { slug:"japan", city:"Japan", code:"NRT", airport:"Narita Intl Airport", country:"Japan", flag:"🇯🇵", priceRatio:2.2, avgFlightHours:6.0, avgTempC:16, avgRainMm:130, aliases:["narita","nrt","jp"], isPopularDestination:true, type: "country" },
  { slug:"laos", city:"Laos", code:"VTE", airport:"Wattay Intl Airport", country:"Laos", flag:"🇱🇦", priceRatio:0.9, avgFlightHours:1.2, avgTempC:26, avgRainMm:150, aliases:["vte","lao","lao-pdr"], isPopularDestination:true, type: "country" },
  { slug:"macau", city:"Macau", code:"MFM", airport:"Macau Intl Airport", country:"Macau", flag:"🇲🇴", priceRatio:1.4, avgFlightHours:2.5, avgTempC:23, avgRainMm:170, aliases:["mfm","mo","macao"], isPopularDestination:true, type: "country" },
  { slug:"malaysia", city:"Malaysia", code:"KUL", airport:"KLIA", country:"Malaysia", flag:"🇲🇾", priceRatio:0.75, avgFlightHours:2.2, avgTempC:28, avgRainMm:210, aliases:["kul","my"], isPopularDestination:true, type: "country" },
  { slug:"philippines", city:"Philippines", code:"MNL", airport:"Ninoy Aquino Intl", country:"Philippines", flag:"🇵🇭", priceRatio:1.2, avgFlightHours:3.3, avgTempC:28, avgRainMm:190, aliases:["mnl","ph"], isPopularDestination:true, type: "country" },
  { slug:"south-korea", city:"South Korea", code:"ICN", airport:"Incheon Intl Airport", country:"South Korea", flag:"🇰🇷", priceRatio:2.0, avgFlightHours:5.5, avgTempC:12, avgRainMm:110, aliases:["icn","korea","kr","republic-of-korea"], isPopularDestination:true, type: "country" },
  { slug:"taiwan", city:"Taiwan", code:"TPE", airport:"Taoyuan Intl Airport", country:"Taiwan", flag:"🇹🇼", priceRatio:1.7, avgFlightHours:3.8, avgTempC:23, avgRainMm:160, aliases:["tpe","tw"], isPopularDestination:true, type: "country" },
  { slug:"thailand", city:"Thailand", code:"BKK", airport:"Suvarnabhumi Airport", country:"Thailand", flag:"🇹🇭", priceRatio:0.5, avgFlightHours:1.0, avgTempC:29, avgRainMm:150, aliases:["bkk","th","siam"], isPopularDestination:true, type: "country" },
  { slug:"united-arab-emirates", city:"United Arab Emirates", code:"DXB", airport:"Dubai Intl Airport", country:"United Arab Emirates", flag:"🇦🇪", priceRatio:2.5, avgFlightHours:6.5, avgTempC:28, avgRainMm:10, aliases:["uae","dxb","emirates","u-a-e"], isPopularDestination:true, type: "country" },
  { slug:"vietnam", city:"Vietnam", code:"HAN", airport:"Noi Bai Intl Airport", country:"Vietnam", flag:"🇻🇳", priceRatio:0.85, avgFlightHours:1.8, avgTempC:24, avgRainMm:150, aliases:["han","vn"], isPopularDestination:true, type: "country" },
  { slug:"yangon", city:"Yangon", code:"RGN", airport:"Yangon Intl Airport", country:"Myanmar", flag:"🇲🇲", priceRatio:0.8, avgFlightHours:1.3, avgTempC:28, avgRainMm:240, aliases:["rgn"], isPopularCity:true },
  { slug:"mandalay", city:"Mandalay", code:"MDL", airport:"Mandalay Intl Airport", country:"Myanmar", flag:"🇲🇲", priceRatio:0.85, avgFlightHours:1.5, avgTempC:27, avgRainMm:130, aliases:["mdl"], isPopularCity:true },
  { slug:"kuala-lumpur", city:"Kuala Lumpur", code:"KUL", airport:"KLIA", country:"Malaysia", flag:"🇲🇾", priceRatio:0.7, avgFlightHours:2.2, avgTempC:28, avgRainMm:210, aliases:["kl"], isPopularCity:true },
  { slug:"bangkok", city:"Bangkok", code:"BKK", airport:"Suvarnabhumi Airport", country:"Thailand", flag:"🇹🇭", priceRatio:0.3, avgFlightHours:1.0, avgTempC:29, avgRainMm:150, aliases:["bkk"], isPopularCity:true },
  { slug:"seoul", city:"Seoul", code:"ICN", airport:"Incheon Intl Airport", country:"South Korea", flag:"🇰🇷", priceRatio:2.0, avgFlightHours:5.5, avgTempC:12, avgRainMm:110, aliases:["icn"], isPopularCity:true },
  { slug:"tokyo", city:"Tokyo", code:"NRT", airport:"Narita Intl Airport", country:"Japan", flag:"🇯🇵", priceRatio:2.2, avgFlightHours:6.0, avgTempC:16, avgRainMm:130, aliases:["narita","nrt"], isPopularCity:true },
  { slug:"singapore-city", city:"Singapore", code:"SIN", airport:"Changi Airport", country:"Singapore", flag:"🇸🇬", priceRatio:1.0, avgFlightHours:2.4, avgTempC:27, avgRainMm:190, aliases:["singapore-city-page","singapore-sin"], isPopularCity:true, type:"city" },
  { slug:"hong-kong-city", city:"Hong Kong", code:"HKG", airport:"Hong Kong Intl Airport", country:"Hong Kong", flag:"🇭🇰", priceRatio:1.5, avgFlightHours:2.8, avgTempC:23, avgRainMm:180, aliases:["hong-kong-city-page","hong-kong-hkg"], isPopularCity:true, type:"city" },
  { slug:"bali", city:"Bali", code:"DPS", airport:"Ngurah Rai Intl", country:"Indonesia", flag:"🇮🇩", priceRatio:0.98, avgFlightHours:4.5, avgTempC:27, avgRainMm:170, aliases:["denpasar","dps"], isPopularCity:true },
  { slug:"phuket", city:"Phuket", code:"HKT", airport:"Phuket Intl Airport", country:"Thailand", flag:"🇹🇭", priceRatio:0.95, avgFlightHours:2.0, avgTempC:28, avgRainMm:180, aliases:["hkt"], isPopularCity:true },
  { slug:"da-nang", city:"Da Nang", code:"DAD", airport:"Da Nang Intl Airport", country:"Vietnam", flag:"🇻🇳", priceRatio:0.78, avgFlightHours:2.5, avgTempC:25, avgRainMm:140, aliases:["dad"], isPopularCity:true },
  { slug:"ho-chi-minh-city", city:"Ho Chi Minh City", code:"SGN", airport:"Tan Son Nhat Intl", country:"Vietnam", flag:"🇻🇳", priceRatio:0.80, avgFlightHours:2.0, avgTempC:28, avgRainMm:160, aliases:["sgn","hcmc"], isPopularCity:true },
  { slug:"siem-reap", city:"Siem Reap", code:"SAI", airport:"Siem Reap–Angkor Intl", country:"Cambodia", flag:"🇰🇭", priceRatio:0.85, avgFlightHours:2.0, avgTempC:27, avgRainMm:150, aliases:["sai"], isPopularCity:true },
  { slug:"taipei", city:"Taipei", code:"TPE", airport:"Taoyuan Intl Airport", country:"Taiwan", flag:"🇹🇼", priceRatio:1.7, avgFlightHours:3.8, avgTempC:23, avgRainMm:160, aliases:["tpe"], isPopularCity:true },
  { slug:"osaka", city:"Osaka", code:"OSA", airport:"Kansai Intl Airport", country:"Japan", flag:"🇯🇵", priceRatio:1.15, avgFlightHours:6.5, avgTempC:16, avgRainMm:110, aliases:["kix"], isPopularCity:true },
  { slug:"chiang-mai", city:"Chiang Mai", code:"CNX", airport:"Chiang Mai Intl", country:"Thailand", flag:"🇹🇭", priceRatio:0.82, avgFlightHours:1.5, avgTempC:26, avgRainMm:120, aliases:["cnx"], isPopularCity:true },
  { slug:"phnom-penh", city:"Phnom Penh", code:"PNH", airport:"Phnom Penh Intl Airport", country:"Cambodia", flag:"🇰🇭", priceRatio:0.85, avgFlightHours:1.2, avgTempC:28, avgRainMm:150, aliases:["pnh"] },
  { slug:"beijing", city:"Beijing", code:"PEK", airport:"Beijing Capital Intl", country:"China", flag:"🇨🇳", priceRatio:1.8, avgFlightHours:5.0, avgTempC:13, avgRainMm:60 },
  { slug:"shanghai", city:"Shanghai", code:"PVG", airport:"Pudong Intl", country:"China", flag:"🇨🇳", priceRatio:1.7, avgFlightHours:4.5, avgTempC:16, avgRainMm:110 },
  { slug:"guangzhou", city:"Guangzhou", code:"CAN", airport:"Baiyun Intl", country:"China", flag:"🇨🇳", priceRatio:1.5, avgFlightHours:4.0, avgTempC:22, avgRainMm:170 },
  { slug:"chengdu", city:"Chengdu", code:"CTU", airport:"Shuangliu Intl", country:"China", flag:"🇨🇳", priceRatio:1.3, avgFlightHours:5.0, avgTempC:16, avgRainMm:90 },
  { slug:"shenzhen", city:"Shenzhen", code:"SZX", airport:"Bao'an Intl", country:"China", flag:"🇨🇳", priceRatio:1.6, avgFlightHours:4.0, avgTempC:23, avgRainMm:190 },
  { slug:"mumbai", city:"Mumbai", code:"BOM", airport:"Chhatrapati Shivaji Intl", country:"India", flag:"🇮🇳", priceRatio:1.6, avgFlightHours:4.5, avgTempC:28, avgRainMm:200 },
  { slug:"dubai", city:"Dubai", code:"DXB", airport:"Dubai Intl Airport", country:"United Arab Emirates", flag:"🇦🇪", priceRatio:2.5, avgFlightHours:6.5, avgTempC:28, avgRainMm:10 },
  { slug:"hanoi", city:"Hanoi", code:"HAN", airport:"Noi Bai Intl Airport", country:"Vietnam", flag:"🇻🇳", priceRatio:0.9, avgFlightHours:1.8, avgTempC:24, avgRainMm:150 },
  { slug:"krabi", city:"Krabi", code:"KBV", airport:"Krabi Intl Airport", country:"Thailand", flag:"🇹🇭", priceRatio:0.90, avgFlightHours:2.2, avgTempC:28, avgRainMm:170 },
  { slug:"penang", city:"Penang", code:"PEN", airport:"Penang Intl Airport", country:"Malaysia", flag:"🇲🇾", priceRatio:0.75, avgFlightHours:1.8, avgTempC:27, avgRainMm:190 },
  { slug:"luang-prabang", city:"Luang Prabang", code:"LPQ", airport:"Luang Prabang Intl", country:"Laos", flag:"🇱🇦", priceRatio:0.88, avgFlightHours:1.5, avgTempC:25, avgRainMm:140 },
];

export function toSlug(value: string): string {
  return value.trim().toLowerCase().replace(/&/g,"and").replace(/[^\w\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-");
}

export function getSeedBySlug(slug: string): DestinationSeed | undefined {
  const normalized = toSlug(slug);
  return DESTINATION_SEEDS.find(s => toSlug(s.slug) === normalized || s.aliases?.map(toSlug).includes(normalized));
}
