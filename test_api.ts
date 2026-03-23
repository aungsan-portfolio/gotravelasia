import { searchHotels } from "./server/api/hotels.ts";

const req = {
  query: { city: "kunming", checkIn: "2026-03-25", checkOut: "2026-04-08", adults: "2", rooms: "1", page: "1", sort: "rank" }
};

const res = {
  status: (code: number) => ({
    json: (data: any) => console.log("STATUS", code, JSON.stringify(data, null, 2))
  }),
  json: (data: any) => console.log("SUCCESS", JSON.stringify(data, null, 2))
};

searchHotels(req as any, res as any).catch(console.error);
