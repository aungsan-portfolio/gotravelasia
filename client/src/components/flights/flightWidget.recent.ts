export const LS_KEY = "gt_recent_searches";
export const MAX_RECENT = 5;

export interface RecentSearchRecord {
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string;
    priceAtSearch: number | null;
    timestamp: number;
}

export const recentSearches = {
    load(): RecentSearchRecord[] {
        try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
        catch { return []; }
    },
    save(r: RecentSearchRecord) {
        const list = recentSearches.load().filter(s => !(s.origin === r.origin && s.destination === r.destination));
        localStorage.setItem(LS_KEY, JSON.stringify([r, ...list].slice(0, MAX_RECENT)));
    },
    clear() { localStorage.removeItem(LS_KEY); },
};
