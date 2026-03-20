import axios from "axios";
import dotenv from "dotenv";
import path from "path";

// Ensure env is loaded even if this is called from a standalone script
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

/**
 * Agoda API Client for GoTravel Asia
 * Handles hotel search and availability requests.
 */

import type { AgodaSearchParams, AgodaHotelRate } from "@shared/types/agoda";

export class AgodaClient {
  private apiKey: string;
  private siteId: string;
  private baseUrl = "https://affiliateapi7643.agoda.com/api/v1/AvailabilitySearch";

  constructor() {
    const fullKey = process.env.AGODA_API_KEY || "";
    console.log(`[AgodaClient] Initializing. AGODA_API_KEY length: ${fullKey.length}`);
    
    const [siteId, apiKey] = fullKey.split(":");
    
    this.siteId = siteId || process.env.VITE_AGODA_CID || "";
    this.apiKey = apiKey || "";

    console.log(`[AgodaClient] SiteID: ${this.siteId}, APIKey ending in ...${this.apiKey.substring(this.apiKey.length - 4)}`);

    if (!this.siteId || !this.apiKey) {
      console.warn("[AgodaClient] Missing API Key or Site ID. Integration will be disabled.");
    }
  }

  async searchAvailability(params: AgodaSearchParams): Promise<AgodaHotelRate[]> {
    if (!this.apiKey) return [];

    try {
      const payload = {
        siteId: this.siteId,
        apiKey: this.apiKey,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: params.rooms || 1,
        adults: params.adults || 2,
        children: params.children || 0,
        propertyIds: params.propertyIds,
        currency: params.currency || "USD",
        language: params.language || "en-us",
        userCountry: params.userCountry || "PH", // Fallback to PH for testing
      };

      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.apiKey,
        },
        timeout: 10000,
      });

      console.log(`[AgodaClient] Raw Response for ${params.propertyIds[0]}...:`, JSON.stringify(response.data).substring(0, 500));

      const results = response.data?.results || [];
      
      return results.map((hotel: any) => ({
        hotelId: hotel.hotelId,
        hotelName: hotel.hotelName,
        cheapestPrice: hotel.cheapestRate?.price || 0,
        currency: payload.currency,
        discountPercentage: hotel.cheapestRate?.discount || 0,
        imageUrl: hotel.images?.[0]?.url,
        bookingUrl: `https://www.agoda.com/search?cid=${this.siteId}&hotel_id=${hotel.hotelId}`,
      }));
    } catch (error: any) {
      console.error("[AgodaClient] Error fetching availability:", error.response?.data || error.message);
      return [];
    }
  }
}
