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
