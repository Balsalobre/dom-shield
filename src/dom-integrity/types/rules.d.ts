export type ElementDetectionParams = { selector: string };
export type LiveElementDetectionParams = { selector: string };
export type SuspiciousScriptsParams = { domains: string[] };

export interface Rule<T = void> {
    readonly rule: string;
    execute: (params: T) => void;
    disconnect?: () => void;
}

