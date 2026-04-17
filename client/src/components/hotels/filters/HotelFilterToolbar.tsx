import { memo } from "react";

import { HotelResultsToolbar } from "@/components/hotels/results/HotelResultsToolbar";
import type { HotelFilterId } from "@/types/hotels";
import type { HotelSort } from "@shared/hotels/types";

interface HotelFilterToolbarProps {
  sort: HotelSort;
  activeFilters: HotelFilterId[];
  onSortChange: (value: HotelSort) => void;
  onToggleFilter: (filterId: HotelFilterId) => void;
  onClearFilters: () => void;
  totalFound: number;
}

/**
 * @deprecated
 * Use `HotelResultsToolbar` from `components/hotels/results/HotelResultsToolbar`
 * for all new work. This wrapper stays in place to avoid breaking older imports.
 */
function HotelFilterToolbarComponent(props: HotelFilterToolbarProps) {
  return <HotelResultsToolbar {...props} />;
}

export const HotelFilterToolbar = memo(HotelFilterToolbarComponent);
