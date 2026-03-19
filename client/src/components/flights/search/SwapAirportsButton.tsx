// components/flights/search/SwapAirportsButton.tsx

interface Props {
  onClick: () => void;
}

export function SwapAirportsButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Swap origin and destination"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-800"
    >
      {/* ⇄ swap icon */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 4.5h9M7.5 2l3 2.5-3 2.5M13 9.5H4M6.5 7l-3 2.5 3 2.5"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
