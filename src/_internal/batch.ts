let _batching = false;
const tasksMap = new WeakMap<WeakKey, () => void>();

export function batch(fn: () => void): void {
  if (_batching) {
    console.warn("nested batch");
    fn();
    return;
  }

  try {
    _batching = true;
    fn();
  } finally {
    _batching = false;
  }
}

export function isBatching(): boolean {
  return _batching;
}

export function enqueue(key: WeakKey, task: () => void): void {
  if (!_batching) {
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
