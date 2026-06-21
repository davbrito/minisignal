import { expect, test } from "vitest";
import { signal } from "../src/signal.js";
import { derived } from "../src/derived.js";

test("valueOf returns the current value", () => {
  const s = signal(42);
  expect(s.valueOf()).toBe(42);

  s.value = 100;
  expect(s.valueOf()).toBe(100);
});

test("valueOf enables numeric coercion", () => {
  const s = signal(5);
  const result = +s + 3;
  expect(result).toBe(8);
});

test("toString returns the string representation", () => {
  const s = signal(42);
  expect(s.toString()).toBe("42");

  const s2 = signal("hello");
  expect(s2.toString()).toBe("hello");
});

test("toString works in template literals", () => {
  const s = signal(42);
  expect(`${s}`).toBe("42");
});

test("toJSON returns the value for JSON.stringify", () => {
  const s = signal(42);
  expect(s.toJSON()).toBe(42);

  const obj = { count: s };
  expect(JSON.stringify(obj)).toBe('{"count":42}');
});

test("toJSON on derived signal", () => {
  const s = signal(5);
  const d = derived(() => s.value * 2);

  expect(JSON.stringify({ val: d })).toBe('{"val":10}');
});

test("toString on derived signal", () => {
  const s = signal(5);
  const d = derived(() => s.value * 2);

  expect(d.toString()).toBe("10");
});

test("valueOf on derived signal", () => {
  const s = signal(5);
  const d = derived(() => s.value * 2);

  expect(d.valueOf()).toBe(10);
});
