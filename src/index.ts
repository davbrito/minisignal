import { batch as baseBatch } from "./_internal/batch.js";

export * from "./derived.js";
export * from "./signal.js";

export const batch: (fn: () => void) => void = baseBatch;
