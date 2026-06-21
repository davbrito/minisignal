import { expect, test, vi } from "vitest";
import { signal } from "../src/signal.js";
import { effect } from "../src/effect.js";
import { derived } from "../src/derived.js";

test("peek returns the current value", () => {
  const s = signal(42);
  expect(s.peek()).toBe(42);
});

test("peek returns the updated value after change", () => {
  const s = signal(1);
  s.value = 42;
  expect(s.peek()).toBe(42);
});

test("peek does not create subscription when read in an effect", () => {
  const s = signal(1);
  const fn = vi.fn();

  effect(() => {
    fn(s.peek());
  });

  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledWith(1);

  s.value = 2;

  // effect should NOT re-run because peek doesn't subscribe
  expect(fn).toHaveBeenCalledTimes(1);
});

test("peek on derived signal returns correct value", () => {
  const s = signal(1);
  const d = derived(() => s.value * 10);

  expect(d.peek()).toBe(10);

  s.value = 5;

  expect(d.peek()).toBe(50);
});
