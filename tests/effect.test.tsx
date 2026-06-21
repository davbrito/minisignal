import { expect, test, vi } from "vitest";
import { effect } from "../src/effect";
import { signal } from "../src/signal";
import { derived } from "../src/derived";

test("effect runs immediately", () => {
  const fn = vi.fn();
  effect(fn);
  expect(fn).toHaveBeenCalledTimes(1);
});

test("effect runs when signal changes", () => {
  const s = signal(1);
  const fn = vi.fn();
  effect(() => {
    fn(s.value);
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(1);

  s.value = 2;
  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(2, 2);
});

test("effect runs when derived value changes", () => {
  const s = signal(1);
  const d = derived(() => s.value * 10);
  const fn = vi.fn();

  effect(() => {
    fn(d.value);
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(10);

  s.value = 2;

  expect(fn).toHaveBeenCalledTimes(2);
  expect(fn).toHaveBeenNthCalledWith(2, 20);
});

test("dispose stops the effect from reacting to changes", () => {
  const s = signal(1);
  const fn = vi.fn();

  const dispose = effect(() => {
    fn(s.value);
  });

  expect(fn).toHaveBeenCalledTimes(1);

  dispose();

  s.value = 2;

  expect(fn).toHaveBeenCalledTimes(1);
});

test("effect cleanup is called before re-run", () => {
  const s = signal(1);
  const cleanup = vi.fn();
  const fn = vi.fn(() => {
    void s.value;
    return cleanup;
  });

  effect(fn);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(cleanup).not.toHaveBeenCalled();

  s.value = 2;

  expect(fn).toHaveBeenCalledTimes(2);
  expect(cleanup).toHaveBeenCalledTimes(1);
});

test("effect dispose calls cleanup", () => {
  const cleanup = vi.fn();

  const dispose = effect(() => {
    return cleanup;
  });

  expect(cleanup).not.toHaveBeenCalled();

  dispose();

  expect(cleanup).toHaveBeenCalledTimes(1);
});

test("effect error on initial run disposes and re-throws", () => {
  expect(() => {
    effect(() => {
      throw new Error("boom");
    });
  }).toThrow("boom");
});

test("effect with no signal dependencies returns dispose", () => {
  const fn = vi.fn();
  const dispose = effect(() => {
    fn();
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(typeof dispose).toBe("function");
  expect(() => dispose()).not.toThrow();
});

test("multiple effects on the same signal", () => {
  const s = signal(1);
  const fn1 = vi.fn();
  const fn2 = vi.fn();

  effect(() => {
    fn1(s.value);
  });
  effect(() => {
    fn2(s.value);
  });

  expect(fn1).toHaveBeenCalledWith(1);
  expect(fn2).toHaveBeenCalledWith(1);

  s.value = 2;

  expect(fn1).toHaveBeenCalledWith(2);
  expect(fn2).toHaveBeenCalledWith(2);
});

test("double dispose is safe", () => {
  const s = signal(1);
  const cleanup = vi.fn();

  const dispose = effect(() => {
    void s.value;
    return cleanup;
  });

  dispose();
  expect(cleanup).toHaveBeenCalledTimes(1);

  dispose();
  expect(cleanup).toHaveBeenCalledTimes(1); // not called again
});

test("effect re-runs when any tracked signal changes", () => {
  const toggle = signal(true);
  const s1 = signal("a");
  const s2 = signal("b");
  const fn = vi.fn();

  effect(() => {
    fn(toggle.value ? s1.value : s2.value);
  });

  expect(fn).toHaveBeenCalledWith("a");
  expect(fn).toHaveBeenCalledTimes(1);

  // Change s1 — re-runs
  s1.value = "A";
  expect(fn).toHaveBeenCalledWith("A");
  expect(fn).toHaveBeenCalledTimes(2);

  // Toggle to track s2
  toggle.value = false;
  expect(fn).toHaveBeenCalledWith("b");
  expect(fn).toHaveBeenCalledTimes(3);

  // s2 changes — re-runs
  s2.value = "B";
  expect(fn).toHaveBeenCalledWith("B");
  expect(fn).toHaveBeenCalledTimes(4);
});
