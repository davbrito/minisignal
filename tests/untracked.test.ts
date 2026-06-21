import { expect, test, vi } from "vitest";
import { untracked } from "../src/_internal/consume.js";
import { signal } from "../src/signal.js";
import { effect } from "../src/effect.js";

test("untracked returns the result of the function", () => {
  const result = untracked(() => 42);
  expect(result).toBe(42);
});

test("untracked does not create subscriptions", () => {
  const s = signal(1);
  const fn = vi.fn();

  effect(() => {
    const val = untracked(() => s.value);
    fn(val);
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(1);

  s.value = 2;

  // effect should NOT re-run because the signal was read inside untracked
  expect(fn).toHaveBeenCalledTimes(1);
});

test("untracked still returns correct value outside effect", () => {
  const s = signal(42);
  const val = untracked(() => s.value);
  expect(val).toBe(42);
});

test("nested untracked works", () => {
  const s = signal(1);
  const fn = vi.fn();

  effect(() => {
    const val = untracked(() => {
      return untracked(() => s.value);
    });
    fn(val);
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(1);

  s.value = 2;

  expect(fn).toHaveBeenCalledTimes(1);
});
