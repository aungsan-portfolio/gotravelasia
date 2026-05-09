import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Heart, Search, ExternalLink, Star, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/seo/SEO";
import { useWishlist, type NormalizedSavedHotel } from "@/hooks/useWishlist";

// ─── Saved Hotel Card ───────────────────────────────────────────

function SavedHotelCard({ hotel }: { hotel: NormalizedSavedHotel }) {
  const [imgError, setImgError] = useState(false);

  const formattedPrice = useMemo(() => {
    if (!hotel.price) return null;
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: hotel.currency || "USD",
        maximumFractionDigits: 0,
      }).format(hotel.price);
    } catch {
      return `$${hotel.price}`;
    }
  }, [hotel.price, hotel.currency]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {hotel.imageUrl && !imgError ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
            🏨
          </div>
        )}
        {/* Provider Badge */}
        <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {hotel.provider === "agoda" ? "Agoda" : hotel.provider}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-slate-900">
          {hotel.name}
        </h3>

        {hotel.city && (
          <div className="mb-2 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{hotel.city}</span>
          </div>
        )}

        {/* Stars + Rating */}
        <div className="mb-3 flex items-center gap-2">
          {hotel.stars != null && hotel.stars > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: hotel.stars }, (_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
          )}
          {hotel.reviewScore && (
            <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-xs font-bold text-white">
              {hotel.reviewScore}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between">
          <div>
            {formattedPrice ? (
              <>
                <span className="text-xs text-slate-500">from</span>
                <span className="ml-1 text-lg font-bold text-slate-900">
                  {formattedPrice}
                </span>
                <span className="text-xs text-slate-500">/night</span>
              </>
            ) : (
              <span className="text-sm text-slate-400">Price unavailable</span>
            )}
          </div>

          {hotel.bookingUrl ? (
            <a
              href={hotel.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
            >
              View Deal
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Link
              href={`/hotels/detail/${hotel.hotelId}`}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-rose-100">
        <Heart className="h-10 w-10 text-rose-400" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        No saved hotels yet
      </h2>
      <p className="mb-6 text-sm text-slate-500 leading-relaxed">
        Tap the heart icon on any hotel to save it here. Your saved hotels will
        be available across all your devices when you're signed in.
      </p>
      <Link
        href="/hotels"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Search className="h-4 w-4" />
        Search Hotels
      </Link>
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────

function SavedHotelsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200"
        >
          <div className="h-48 bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="flex justify-between">
              <div className="h-6 w-20 rounded bg-slate-200" />
              <div className="h-8 w-24 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function SavedHotelsPage() {
  const { normalizedSavedHotels, isLoading, isAuthenticated } = useWishlist();

  return (
    <Layout>
      <SEO
        path="/saved-hotels"
        title="Saved Hotels | GoTravelAsia"
        description="View and manage your saved hotels. Compare prices and continue booking your favorites."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-sm">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Saved Hotels
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            {isAuthenticated
              ? "Your saved hotels are synced across all devices."
              : "Sign in to sync your saved hotels across devices."}
          </p>
          {normalizedSavedHotels.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              {normalizedSavedHotels.length} hotel{normalizedSavedHotels.length !== 1 ? "s" : ""} saved
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <SavedHotelsSkeleton />
        ) : normalizedSavedHotels.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {normalizedSavedHotels.map((hotel) => (
              <SavedHotelCard key={`${hotel.hotelId}-${hotel.provider}`} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
