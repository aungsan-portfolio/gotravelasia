export interface Airport {
    code: string;
    name: string;
    country: string;
    isPopular?: boolean;
}

export type NlStatus = "idle" | "sending" | "done" | "error";
