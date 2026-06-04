import * as Sentry from "@sentry/node";
import type { HotelProvider, HotelSearchCriteria, HotelProviderResponse } from "../../shared/hotels/providers/types.js";
import type { HotelResult } from "../../shared/hotels/types.js";

/**
 * Coordinates multiple hotel providers to add fallback capabilities using individual timeouts.
 */
export class ProviderOrchestrator {
  private providers: HotelProvider[];

  constructor(providers: HotelProvider[]) {
    // Sort providers by priority: 1 is primary (Agoda), 2 is secondary (Hotellook)
    this.providers = [...providers].sort((a, b) => a.priority - b.priority);
  }

  private timeoutAfter(ms: number, providerId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Provider ${providerId} timed out after ${ms}ms`)), ms);
    });
  }

  async searchHotels(criteria: HotelSearchCriteria): Promise<HotelProviderResponse<any>> {
    // Lazy fallback: try providers in priority order and stop at the first that
    // returns inventory. Secondary providers (e.g. Hotellook) are only invoked
    // when the primary fails or returns no hotels — avoiding a wasted upstream
    // search session on every request when a secondary is configured.
    let primaryResponse: any = null;

    for (const provider of this.providers) {
      const isPrimary = provider.priority <= 1;
      let data: any;

      try {
        data = await Promise.race([
          provider.searchHotels(criteria),
          this.timeoutAfter(provider.timeoutMs, provider.id),
        ]);
      } catch (error) {
        console.error(`[Orchestrator] Provider ${provider.id} search failed:`, error);
        Sentry.captureException(error, { tags: { provider: provider.id, context: "search" } });
        continue;
      }

      if (isPrimary) {
        // Keep the primary's payload so we can preserve its diagnostics/warnings
        // for the empty-state derivation when no provider has inventory.
        primaryResponse = data;
      }

      if (data && Array.isArray(data.hotels) && data.hotels.length > 0) {
        if (isPrimary) {
          Sentry.setTag("hotels.source", provider.id);
          Sentry.setTag("provider.primary.healthy", "true");
          return { data, source: provider.id, isFallback: false };
        }

        Sentry.addBreadcrumb({
          category: "hotels.fallback",
          message: `Primary provider failed or returned no inventory. Falling back to ${provider.id}.`,
          level: "warning",
        });
        Sentry.setTag("hotels.source", provider.id);
        Sentry.setTag("provider.primary.healthy", "false");
        return {
          data: {
            ...data,
            warning: "Showing alternative inventory (Hotellook). Live Agoda results unavailable.",
          },
          source: provider.id,
          isFallback: true,
        };
      }
    }

    // No provider returned inventory. Prefer the primary's response so its
    // diagnostics/warnings still drive the empty-state reason downstream.
    if (primaryResponse) {
      Sentry.setTag("hotels.source", this.providers[0]?.id ?? "agoda");
      Sentry.setTag("provider.primary.healthy", "false");
      return {
        data: primaryResponse,
        source: this.providers[0]?.id ?? "agoda",
        isFallback: false,
      };
    }

    console.error("[Orchestrator] All hotel search providers failed.");
    Sentry.setTag("hotels.source", "failed");
    Sentry.setTag("provider.primary.healthy", "false");
    return {
      data: {
        source: this.providers[0]?.id || "agoda",
        hotels: [],
        totalCount: 0,
        warning: "Live hotel results are temporarily unavailable.",
        warnings: ["All hotel search providers failed or timed out."],
      },
      source: this.providers[0]?.id || "agoda",
      isFallback: false,
    };
  }

  async getHotelDetail(hotelId: string, criteria?: HotelSearchCriteria): Promise<HotelProviderResponse<HotelResult | null>> {
    // Attempt providers in priority order for details lookup
    for (const provider of this.providers) {
      try {
        const detail = await Promise.race([
          provider.getHotelDetail(hotelId, criteria),
          this.timeoutAfter(provider.timeoutMs, provider.id),
        ]);
        
        if (detail) {
          if (provider.priority > 1) {
            Sentry.addBreadcrumb({
              category: "hotels.detail.fallback",
              message: `Primary provider detail fetch failed. Falling back to ${provider.id}.`,
              level: "warning",
            });
          }
          Sentry.setTag("hotels.detail.source", provider.id);
          return {
            data: detail,
            source: provider.id,
            isFallback: provider.priority > 1,
          };
        }
      } catch (error) {
        console.error(`[Orchestrator] Provider ${provider.id} detail fetch failed:`, error);
        Sentry.captureException(error, { tags: { provider: provider.id, context: "detail_lookup" } });
      }
    }

    Sentry.setTag("hotels.detail.source", "failed");
    return {
      data: null,
      source: this.providers[0]?.id ?? "agoda",
      isFallback: false,
    };
  }
}
