import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import type { HotelResult } from "@shared/hotels/types";

// ─── Types ──────────────────────────────────────────────────────

/** Lightweight shape stored in localStorage for unauthenticated users. */
export interface SavedHotel {
  hotelId: string;
  name: string;
  address: string;
  imageUrl: string;
  stars: number;
  reviewScore: number;
  savedAt: number;
}

/** Shape returned by the Cloud Wishlist API (matches DB row). */
export interface CloudWishlistItem {
  id: number;
  userId: number;
  hotelId: string;
  provider: string;
  hotelName: string;
  city: string;
  country: string | null;
  imageUrl: string | null;
  starRating: number | null;
  guestRating: string | null;
  price: number | null;
  currency: string | null;
  bookingUrl: string | null;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ──────────────────────────────────────────────────

const WISHLIST_KEY = "gotravel_hotel_wishlist";
const SYNC_FLAG_KEY = "gotravel_wishlist_synced";
const CLOUD_QUERY_KEY = ["wishlist", "cloud"];

// ─── Local Storage Helpers ──────────────────────────────────────

function readLocalWishlist(): SavedHotel[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(items: SavedHotel[]): void {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save wishlist to local storage", error);
  }
}

function clearLocalWishlist(): void {
  try {
    localStorage.removeItem(WISHLIST_KEY);
  } catch {
    // ignore
  }
}

function markSynced(): void {
  try {
    localStorage.setItem(SYNC_FLAG_KEY, "true");
  } catch {
    // ignore
  }
}

function wasSynced(): boolean {
  try {
    return localStorage.getItem(SYNC_FLAG_KEY) === "true";
  } catch {
    return false;
  }
}

// ─── API Helpers ────────────────────────────────────────────────

async function fetchCloudWishlist(): Promise<CloudWishlistItem[]> {
  const res = await fetch("/api/wishlist");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch wishlist");
  }
  return res.json();
}

async function saveToCloud(payload: Record<string, unknown>): Promise<void> {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save wishlist item");
}

async function removeFromCloud(hotelId: string, provider: string): Promise<void> {
  const params = new URLSearchParams({ hotelId, provider });
  const res = await fetch(`/api/wishlist?${params.toString()}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove wishlist item");
}

/** Convert a HotelResult into the cloud save payload (no userId). */
function buildCloudPayload(hotel: HotelResult): Record<string, unknown> {
  return {
    hotelId: hotel.hotelId,
    provider: hotel.provider ?? "agoda",
    hotelName: hotel.name,
    city: "",
    country: null,
    imageUrl: hotel.images?.[0] ?? hotel.imageUrl ?? null,
    starRating: hotel.stars ?? null,
    guestRating: hotel.reviewScore != null ? String(hotel.reviewScore) : null,
    price: hotel.lowestRate ?? null,
    currency: hotel.currency ?? "USD",
    bookingUrl: hotel.outboundLinks?.agoda ?? null,
    checkIn: null,
    checkOut: null,
  };
}

// ─── Hook ───────────────────────────────────────────────────────

export function useWishlist() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const syncAttemptedRef = useRef(false);

  // ── Local state (for unauthenticated users) ───────────────────
  const [localHotels, setLocalHotels] = useState<SavedHotel[]>([]);

  useEffect(() => {
    setLocalHotels(readLocalWishlist());
  }, []);

  // ── Cloud state (for authenticated users) ─────────────────────
  const cloudQuery = useQuery({
    queryKey: CLOUD_QUERY_KEY,
    queryFn: fetchCloudWishlist,
    enabled: isAuthenticated && !authLoading,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const saveMutation = useMutation({
    mutationFn: saveToCloud,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOUD_QUERY_KEY });
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ hotelId, provider }: { hotelId: string; provider: string }) =>
      removeFromCloud(hotelId, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOUD_QUERY_KEY });
    },
  });

  // ── Sync localStorage → Cloud on login ────────────────────────
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    if (syncAttemptedRef.current) return;
    if (wasSynced()) return;

    syncAttemptedRef.current = true;

    const localItems = readLocalWishlist();
    if (localItems.length === 0) {
      markSynced();
      return;
    }

    // Fire-and-forget sync: POST each local item to cloud
    (async () => {
      try {
        for (const item of localItems) {
          await saveToCloud({
            hotelId: item.hotelId,
            provider: "agoda",
            hotelName: item.name,
            city: "",
            country: null,
            imageUrl: item.imageUrl || null,
            starRating: item.stars || null,
            guestRating: item.reviewScore ? String(item.reviewScore) : null,
            price: null,
            currency: "USD",
            bookingUrl: null,
            checkIn: null,
            checkOut: null,
          });
        }
        clearLocalWishlist();
        setLocalHotels([]);
        markSynced();
        queryClient.invalidateQueries({ queryKey: CLOUD_QUERY_KEY });
      } catch (error) {
        console.error("[Wishlist] Failed to sync local items to cloud:", error);
        // Keep local items as fallback; don't mark synced
      }
    })();
  }, [isAuthenticated, authLoading, queryClient]);

  // ── Unified API ───────────────────────────────────────────────

  const toggleSave = useCallback(
    (hotel: HotelResult) => {
      if (isAuthenticated) {
        // Cloud path
        const cloudItems = cloudQuery.data ?? [];
        const existing = cloudItems.find((item) => item.hotelId === hotel.hotelId);

        if (existing) {
          removeMutation.mutate({
            hotelId: existing.hotelId,
            provider: existing.provider,
          });
        } else {
          saveMutation.mutate(buildCloudPayload(hotel));
        }
      } else {
        // Local path
        setLocalHotels((prev) => {
          const isAlreadySaved = prev.some((h) => h.hotelId === hotel.hotelId);

          let nextList: SavedHotel[];
          if (isAlreadySaved) {
            nextList = prev.filter((h) => h.hotelId !== hotel.hotelId);
          } else {
            const newSaved: SavedHotel = {
              hotelId: hotel.hotelId,
              name: hotel.name,
              address: hotel.address || "",
              imageUrl: hotel.images?.[0] || hotel.imageUrl,
              stars: hotel.stars || 0,
              reviewScore: hotel.reviewScore || 0,
              savedAt: Date.now(),
            };
            nextList = [newSaved, ...prev];
          }

          writeLocalWishlist(nextList);
          return nextList;
        });
      }
    },
    [isAuthenticated, cloudQuery.data, removeMutation, saveMutation],
  );

  const isSaved = useCallback(
    (hotelId: string): boolean => {
      if (isAuthenticated) {
        return (cloudQuery.data ?? []).some((item) => item.hotelId === hotelId);
      }
      return localHotels.some((h) => h.hotelId === hotelId);
    },
    [isAuthenticated, cloudQuery.data, localHotels],
  );

  // Expose a unified list for use in SavedHotelsPage
  const savedHotels = isAuthenticated ? (cloudQuery.data ?? []) : localHotels;

  return {
    savedHotels,
    toggleSave,
    isSaved,
    isLoading: isAuthenticated ? cloudQuery.isLoading : false,
    isAuthenticated,
  };
}
