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
    const startTime = Date.now();

    // Race all providers with individual timeouts in parallel
    const results = await Promise.allSettled(
      this.providers.map(p =>
        Promise.race([
          p.searchHotels(criteria),
          this.timeoutAfter(p.timeoutMs, p.id),
        ])
      )
    );

    // Collect successful results
    const successful = results
      .map((r, idx) => ({ result: r, provider: this.providers[idx] }))
      .filter(({ result }) => result.status === "fulfilled")
      .map(({ result, provider }) => ({
        provider: provider.id,
        data: (result as PromiseFulfilledResult<any>).value,
      }));

    if (successful.length === 0) {
      console.error("[Orchestrator] All hotel search providers failed.");
      Sentry.setTag("hotels.source", "failed");
      Sentry.setTag("provider.primary.healthy", "false");
      throw new Error("All hotel search providers failed or timed out.");
    }

    // Sort by priority to find primary first
    const primary = successful.find(s => s.provider === "agoda");
    const secondary = successful.find(s => s.provider === "hotellook");

    const elapsedMs = Date.now() - startTime;

    if (primary && primary.data && primary.data.hotels && primary.data.hotels.length > 0) {
      Sentry.setTag("hotels.source", "agoda");
      Sentry.setTag("provider.primary.healthy", "true");
      return {
        data: primary.data,
        source: "agoda",
        isFallback: false,
      };
    }

    // If primary failed or returned empty results, fall back to secondary
    if (secondary && secondary.data && secondary.data.hotels && secondary.data.hotels.length > 0) {
      Sentry.addBreadcrumb({
        category: "hotels.fallback",
        message: "Primary provider Agoda failed or returned no inventory. Falling back to Hotellook.",
        level: "warning",
      });
      Sentry.setTag("hotels.source", "hotellook");
      Sentry.setTag("provider.primary.healthy", "false");
      return {
        data: {
          ...secondary.data,
          warning: "Showing alternative inventory (Hotellook). Live Agoda results unavailable.",
        },
        source: "hotellook",
        isFallback: true,
      };
    }

    // Fallback: If primary returned empty results, try secondary even if it was technically successful
    const anySuccessful = successful[0];
    Sentry.setTag("hotels.source", anySuccessful.provider);
    Sentry.setTag("provider.primary.healthy", anySuccessful.provider === "agoda" ? "true" : "false");
    return {
      data: anySuccessful.data,
      source: anySuccessful.provider,
      isFallback: anySuccessful.provider !== "agoda",
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
          return {
            data: detail,
            source: provider.id,
            isFallback: provider.priority > 1,
          };
        }
      } catch (error) {
        console.error(`[Orchestrator] Provider ${provider.id} detail fetch failed:`, error);
      }
    }

    return {
      data: null,
      source: this.providers[0]?.id ?? "agoda",
      isFallback: false,
    };
  }
}
