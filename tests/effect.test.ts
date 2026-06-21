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
