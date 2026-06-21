# minisignal

[![npm version](https://img.shields.io/npm/v/minisignal)](https://www.npmjs.com/package/minisignal)
[![license](https://img.shields.io/npm/l/minisignal)](https://github.com/davbrito/minisignal/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/minisignal)](https://bundlephobia.com/package/minisignal)
![TypeScript](https://img.shields.io/badge/types-TypeScript-blue)

**minisignal** is a tiny, zero-dependency reactive signals library inspired by [Preact Signals](https://preactjs.com/guide/v10/signals/). It provides fine-grained reactivity with automatic dependency tracking, lazy evaluation, and an optional first-class React integration via `useSyncExternalStore`.

> **minisignal** — minimal. reactive. signals.

---

## Features

- **🚀 Tiny** — No external runtime dependencies. Tree-shakeable ESM.
- **⚡ Fine-grained reactivity** — Automatic dependency tracking. Only the consumers that depend on a changed value re-execute.
- **⏳ Lazy derived signals** — Computed values are evaluated lazily and only when read.
- **📦 Batching** — Group multiple writes into a single notification.
- **⚛️ React integration** — Use signals directly on JSX.
- **🕵️ Deep proxy signals** — Reactive wrappers for objects and arrays with deep mutation tracking.
- **🛡️ TypeScript-first** — Full type safety with strict TypeScript types.
- **🔄 Cross-version safe** — Multiple library versions share the same tracking stack via a well-known Symbol.

---

## Installation

```bash
npm install minisignal
# or
pnpm add minisignal
# or
yarn add minisignal
```

React is an optional peer dependency — only install it if you use the React integration:

```bash
npm install react  # optional, only if using minisignal/react
```

---

## Quick Start

```ts
import { signal, derived, effect, batch, untracked } from "minisignal";

// Create a signal
const count = signal(0);

// Read and write values
console.log(count.value); // 0
count.value = 1;

// Derived signals — lazy and cached
const doubled = derived(() => count.value * 2);
console.log(doubled.value); // 2

// Effects — run automatically when dependencies change
effect(() => {
  console.log(`Count is: ${count.value}`);
});
// Logs: "Count is: 1"

count.value = 5;
// Logs: "Count is: 5"

// Batch multiple writes
batch(() => {
  count.value = 10;
  count.value = 20;
});
// The effect only runs once with the final value

// Untracked reads — read without creating a dependency
untracked(() => console.log(count.value));
```

---

## API

### `signal(value)`

Creates a writable reactive signal.

```ts
interface Signal<T> {
  value: T;
  peek(): T;
  valueOf(): T;
  toString(): string;
  toJSON(): T;
  subscribe(listener: () => void): () => void;
}
```

| Method         | Description                                                           |
| -------------- | --------------------------------------------------------------------- |
| `.value`       | Get or set the signal's value. Getting creates a tracking dependency. |
| `.peek()`      | Read the value without creating a tracking dependency.                |
| `.subscribe()` | Subscribe to changes. Returns an unsubscribe function.                |
| `.valueOf()`   | Returns the current value (used by type coercion).                    |
| `.toString()`  | String representation of the value.                                   |
| `.toJSON()`    | JSON serialization support.                                           |

```ts
const name = signal("world");
name.value = "minisignal";
```

### `derived(fn)`

Creates a read-only signal whose value is computed lazily from other signals.

```ts
const a = signal(2);
const b = signal(3);
const sum = derived(() => a.value + b.value);

console.log(sum.value); // 5
a.value = 10;
console.log(sum.value); // 13
```

Derived signals are **lazy** — the computation function only runs when `.value` is read. They **cache** their result and only recompute when a dependency changes.

### `effect(fn)`

Runs a function immediately and automatically re-runs it whenever its tracked dependencies change.

```ts
const count = signal(0);

const dispose = effect(() => {
  console.log(`count is ${count.value}`);
});
// Logs: "count is 0"

count.value = 1;
// Logs: "count is 1"

dispose(); // Stop the effect
count.value = 2;
// Nothing logged
```

Effects support **cleanup functions** — return a function from the effect callback and it will be called before each re-run and on dispose:

```ts
effect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);
});
```

### `batch(fn)`

Groups multiple signal writes so that subscribers are notified at most once, after all writes complete.

```ts
const a = signal(1);
const b = signal(2);
const sum = derived(() => a.value + b.value);

effect(() => console.log(sum.value));

batch(() => {
  a.value = 10;
  b.value = 20;
});
// The effect runs only once, logging: 30
```

### `untracked(fn)`

Reads signals inside `fn` without creating tracking dependencies.

```ts
const x = signal(5);
const y = signal(10);

effect(() => {
  // This effect only tracks `x`, not `y`
  console.log(x.value + untracked(() => y.value));
});
```

### `proxy(initialValue)`

Creates a deeply reactive signal wrapper around objects and arrays. Any nested mutation — including array methods like `push`, `splice`, and property assignments — automatically triggers reactivity.

```ts
const state = proxy({ items: [1, 2, 3], user: { name: "Alice" } });

effect(() => {
  console.log(state.value.items.length);
});

state.value.items.push(4); // Triggers the effect
state.value.user.name = "Bob"; // Triggers the effect
```

---

## React Integration

Import from `minisignal/react` to get signals that double as React elements:

```tsx
import { signal, derived } from "minisignal/react";

const count = signal(0);

// Use directly as a JSX element — it auto-renders on changes
function Counter() {
  return <button onClick={() => count.value++}>Count: {count}</button>;
}

// Or access .value in hooks
function Doubled() {
  const doubled = derived(() => count.value * 2);
  return <span>{doubled}</span>;
}
```

React signals rely on `useSyncExternalStore` for tear-free concurrent rendering. They are fully compatible with React 18 and 19.

---

## Subpath Exports

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./signal": "./dist/signal.js",
    "./derived": "./dist/derived.js",
    "./react": "./dist/react.js"
  }
}
```

| Import path          | Exports                                   |
| -------------------- | ----------------------------------------- |
| `minisignal`         | `signal`, `derived`, `batch`, `untracked` |
| `minisignal/signal`  | `signal`                                  |
| `minisignal/derived` | `derived`                                 |
| `minisignal/react`   | `signal`, `derived` (React elements)      |

---

## Benchmarks

> TODO: Benchmarks coming soon.

---

## TypeScript

This library is written in TypeScript and ships with complete type definitions. Strict TypeScript is supported out of the box — no `@types/` packages needed (beyond React types for the React integration).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on setting up the project, running tests, code style, and the pull request process.

---

## License

[MIT](LICENSE) © [davbrito](https://github.com/davbrito)
