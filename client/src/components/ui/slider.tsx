// client/src/components/ui/slider.tsx
// Lightweight slider matching shadcn API: value, min, max, step, onValueChange
// Uses native <input type="range"> with dark-theme styling

import { useCallback, useId, type InputHTMLAttributes } from "react";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  ...rest
}: SliderProps) {
  const id = useId();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.([Number(e.target.value)]);
    },
    [onValueChange],
  );

  // Compute fill percentage for the track gradient
  const current = value[0] ?? min;
  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;

  return (
    <input
      {...rest}
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={current}
      onChange={handleChange}
      className={["slider-budget", className].filter(Boolean).join(" ")}
      style={{
        background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        ...((rest as Record<string, unknown>).style as React.CSSProperties | undefined),
      }}
    />
  );
}

export default Slider;
