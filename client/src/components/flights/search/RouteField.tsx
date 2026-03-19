// components/flights/search/RouteField.tsx
// Phase 2: delegates to AirportAutocomplete

import type { AirportOption } from "@/features/flights/search/flightSearch.types";
import { AirportAutocomplete } from "./AirportAutocomplete";

interface Props {
  label: string;
  placeholder?: string;
  value: AirportOption | null;
  onChange: (airport: AirportOption | null) => void;
}

export function RouteField({ label, placeholder, value, onChange }: Props) {
  return (
    <AirportAutocomplete
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
