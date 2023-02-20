import { expect, it, test, vi } from "vitest";
import { batch } from "../src/_internal/batch.js";
import { signal } from "../src/signal.js";

test("has the initial value on initialize", () => {
  const s = signal(1);

  expect(s.value).toBe(1);
});

test("has the new value after set", () => {
  const s = signal(1);

  s.value = 2;

  expect(s.value).toBe(2);
});

test("calls the listener when the value changes", () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  s.value = 2;

  expect(listener).toHaveBeenCalledWith(2);
});

test("does not call the listener when the value does not change", () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  expect(listener).not.toHaveBeenCalled();

  s.value = 1;

  expect(listener).not.toHaveBeenCalled();
});

test("does not call the listener when unsubscribed", () => {
  const s = signal(1);
  const listener = vi.fn();

  const unsubscribe = s.subscribe(listener);

  unsubscribe();

  s.value = 2;

  expect(listener).not.toHaveBeenCalled();
});

test("listener calls are batched but not the value updates (so the listener is called with the last value)", async () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  batch(() => {
    s.value = 2;
    s.value = 3;
    s.value = 4;
  });

  expect(s.value).toBe(4);

  expect(listener).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(4);
});

test("updates done in a batch are not called until the batch is done", async () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s.value = i;
    });
  });

  expect(listener).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(9);
});

test("multiple consecutive batches are like a single batch", async () => {
  const s = signal("1");
  const listener = vi.fn();

  s.subscribe(listener);

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s.value = "a" + i;
    });
  });

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s.value = "b" + i;
    });
  });

  expect(listener).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith("b9");
});

test("a sinchronus update between batches should flush the queue and call the listener", async () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s.value = i;
    });
  });

  expect(listener).not.toHaveBeenCalled();

  s.value = 10;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(10);

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
});

test("a batch called with a signal should not batch other signals that are not in the batch", async () => {
  const s1 = signal(1);
  const s2 = signal(1);
  const listener1 = vi.fn();
  const listener2 = vi.fn();

  s1.subscribe(listener1);
  s2.subscribe(listener2);

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s1.value = i;
    });
  });

  s2.value = 2;

  expect(listener1).not.toHaveBeenCalled();
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledWith(2);

  await Promise.resolve();

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenCalledWith(9);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledWith(2);
});

it("should not call the listener when the value assigned is referentially equal to the current value", () => {
  const s = signal(12);
  const listener = vi.fn();

  s.subscribe(listener);

  s.value = 12;

  expect(listener).not.toHaveBeenCalled();
});
