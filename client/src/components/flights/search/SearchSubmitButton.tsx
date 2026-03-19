// components/flights/search/SearchSubmitButton.tsx

interface Props {
  onClick: () => void;
  loading?: boolean;
  fullWidth?: boolean;
}

export function SearchSubmitButton({ onClick, loading = false, fullWidth = false }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label="Search flights"
      className={[
        "inline-flex shrink-0 items-center justify-center gap-2",
        "h-11 rounded-xl bg-neutral-950 px-6",
        "text-sm font-bold text-white",
        "transition-opacity hover:opacity-90",
        "disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        /* Spinner */
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
          <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ) : (
        /* Search icon */
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.8"/>
          <path d="M10 10l3.5 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
      Search
    </button>
  );
}
