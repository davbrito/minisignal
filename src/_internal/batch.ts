import { invariant } from "./utils";

let isBatching = false;
let tasksMap = new WeakMap<WeakKey, () => void>();

export function batch(fn: () => void): void {
  if (isBatching) {
    console.warn("nested batch");
    fn();
    return;
  }

  try {
    isBatching = true;
    fn();
  } finally {
    isBatching = false;
  }
}

export function enqueue(key: WeakKey, task: () => void): void {
  if (!isBatching) {
    tasksMap.delete(key);
    task();
    return;
  }

  const hasTask = tasksMap.has(key);
  tasksMap.set(key, task);
  if (hasTask) return;
  queueMicrotask(() => flushSync(key));
}

function flushSync(key: WeakKey): void {
  const task = tasksMap.get(key);
  if (!task) return;
  task();
}
