import { batch as baseBatch } from "./_internal/batch.js";
import { untracked as baseUntracked } from "./_internal/consume.js";

export * from "./derived.js";
export * from "./signal.js";

export const batch: (fn: () => void) => void = baseBatch;
export const untracked: <T>(fn: () => T) => T = baseUntracked;
