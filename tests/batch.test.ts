import { expect, test, vi } from "vitest";
import { batch, isBatching } from "../src/_internal/batch.js";
import { signal } from "../src/signal.js";

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
  expect(s.value).toBe(4);
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
  expect(s.value).toBe(9);
});

test("multiple consecutive batches are like a single batch", async () => {
  const s = signal("1");
  const listener = vi.fn();

  s.subscribe(() => listener(s.value));

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

  expect(s.value).toBe("b9");
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
  expect(s.value).toBe(10);

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
});

test("a batch called with a signal should not batch other signals that are not in the batch", async () => {
  const s1 = signal(1);
  const s2 = signal(1);
  const listener1 = vi.fn();
  const listener2 = vi.fn();

  s1.subscribe(() => listener1(s1.value));
  s2.subscribe(() => listener2(s2.value));

  batch(() => {
    Array.from({ length: 10 }).forEach((_, i) => {
      s1.value = i;
    });
  });

  s2.value = 2;

  expect(listener1).not.toHaveBeenCalled();
  expect(listener2).toHaveBeenCalledTimes(1);

  await Promise.resolve();

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener1).toHaveBeenCalledWith(9);
  expect(listener2).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledWith(2);
});

test("nested batch defers notifications until outer batch ends", async () => {
  const s = signal(1);
  const listener = vi.fn();
  const innerSpy = vi.fn();
  s.subscribe(listener);

  batch(() => {
    batch(() => {
      s.value = 2;
      innerSpy();
    });
    // inner batch ended, but outer is still running
    expect(listener).not.toHaveBeenCalled();
  });

  // outer batch ended, but flush is deferred via microtask
  expect(listener).not.toHaveBeenCalled();
  expect(s.value).toBe(2);

  await Promise.resolve();

  expect(listener).toHaveBeenCalledTimes(1);
  expect(innerSpy).toHaveBeenCalledTimes(1);
});

test("nested batch does not warn", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  const s = signal(1);

  batch(() => {
    batch(() => {
      s.value = 2;
    });
  });

  expect(warnSpy).not.toHaveBeenCalled();
  warnSpy.mockRestore();
});

test("isBatching returns the correct state", () => {
  expect(isBatching()).toBe(false);

  let innerValue: boolean = false;
  batch(() => {
    innerValue = isBatching();
  });
  expect(innerValue).toBe(true);

  expect(isBatching()).toBe(false);
});

test("multiple different signals batched together", async () => {
  const s1 = signal(1);
  const s2 = signal(10);
  const listener1 = vi.fn();
  const listener2 = vi.fn();

  s1.subscribe(listener1);
  s2.subscribe(listener2);

  batch(() => {
    s1.value = 2;
    s2.value = 20;
  });

  expect(s1.value).toBe(2);
  expect(s2.value).toBe(20);
  expect(listener1).not.toHaveBeenCalled();
  expect(listener2).not.toHaveBeenCalled();

  await Promise.resolve();

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
});
