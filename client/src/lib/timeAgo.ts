export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "Recently found";

  // Handle both "2026-03-14 18:30:00" and "2026-03-14T18:30:00Z"
  const normalized = isoString.includes("T") ? isoString : isoString.replace(" ", "T");
  const date = new Date(normalized);
  
  if (isNaN(date.getTime())) return "Recently found";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1)  return "Just now";
  if (diffMins < 60) return `Found ${diffMins}m ago`;
  if (diffHrs < 24)  return `Found ${diffHrs}h ago`;
  if (diffDays < 7)  return `Found ${diffDays}d ago`;
  
  return `Found on ${date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
}
