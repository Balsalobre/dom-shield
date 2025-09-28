export interface Rule {
    name: string;
    description: string;
    execute: (params?: any) => void;
    shouldRunOnMutation?: (mutation: MutationRecord) => boolean;
}
