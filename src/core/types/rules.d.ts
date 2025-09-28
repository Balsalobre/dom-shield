export interface Rule<T = void> {
  readonly rule: string;
  execute: (params: T) => void;
  disconnect?: () => void;
}
