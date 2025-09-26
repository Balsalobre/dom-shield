export interface Rule {
    rule: string;
    execute: (params?: any) => void;
}
