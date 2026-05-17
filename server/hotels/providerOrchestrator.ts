import type { HotelProvider, HotelSearchCriteria, HotelProviderResponse } from "../../shared/hotels/providers/types.js";
import type { HotelResult } from "../../shared/hotels/types.js";

/**
 * Coordinates multiple hotel providers to add fallback capabilities.
 */
export class ProviderOrchestrator {
  private primaryProvider: HotelProvider;
  private secondaryProviders: HotelProvider[];

  constructor(primaryProvider: HotelProvider, secondaryProviders: HotelProvider[] = []) {
    this.primaryProvider = primaryProvider;
    this.secondaryProviders = secondaryProviders;
  }

  async searchHotels(criteria: HotelSearchCriteria): Promise<HotelProviderResponse<any>> {
    try {
      const results = await this.primaryProvider.searchHotels(criteria);
      
      return {
        data: results,
        source: this.primaryProvider.id,
        isFallback: false
      };
    } catch (error) {
      console.error(`[Orchestrator] Primary provider ${this.primaryProvider.id} failed:`, error);
      
      // Try fallbacks in order
      for (const provider of this.secondaryProviders) {
        try {
          const fallbackResults = await provider.searchHotels(criteria);
          return {
            data: fallbackResults,
            source: provider.id,
            isFallback: true
          };
        } catch (fallbackError) {
          console.error(`[Orchestrator] Fallback provider ${provider.id} failed:`, fallbackError);
        }
      }
      
      // If all fail, throw original error
      throw error;
    }
  }

  async getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelProviderResponse<HotelResult | null>> {
    try {
      const detail = await this.primaryProvider.getHotelDetail(hotelId, criteria);
      return {
        data: detail,
        source: this.primaryProvider.id,
        isFallback: false
      };
    } catch (error) {
      console.error(`[Orchestrator] Primary provider ${this.primaryProvider.id} failed:`, error);
      
      // Try fallbacks in order
      for (const provider of this.secondaryProviders) {
        try {
          const detail = await provider.getHotelDetail(hotelId, criteria);
          return {
            data: detail,
            source: provider.id,
            isFallback: true
          };
        } catch (fallbackError) {
          console.error(`[Orchestrator] Fallback provider ${provider.id} failed:`, fallbackError);
        }
      }
      
      throw error;
    }
  }
}
