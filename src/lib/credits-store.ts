import { useSyncExternalStore } from "react";

let credits = 432;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const creditsStore = {
  get: () => credits,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  decrement: (n = 1) => {
    credits = Math.max(0, credits - n);
    emit();
  },
  set: (n: number) => {
    credits = n;
    emit();
  },
};

export function useCredits() {
  return useSyncExternalStore(creditsStore.subscribe, creditsStore.get, creditsStore.get);
}
