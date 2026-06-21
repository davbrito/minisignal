let batchDepth = 0;
const tasksMap = new WeakMap<WeakKey, () => void>();

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
  }
}

export function isBatching(): boolean {
  return batchDepth > 0;
}

export function enqueue(key: WeakKey, task: () => void): void {
  if (batchDepth === 0) {
    tasksMap.delete(key);
    task();
    return;
  }

  const hasTask = tasksMap.has(key);
  tasksMap.set(key, task);
  if (hasTask) return;
  // eslint-disable-next-line @eslint-react/dom-no-flush-sync
  queueMicrotask(() => flushSync(key));
}

function flushSync(key: WeakKey): void {
  const task = tasksMap.get(key);
  if (!task) return;
  task();
}
