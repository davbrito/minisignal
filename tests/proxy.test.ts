import { describe, expect, test, vi } from "vitest";
import { proxy } from "../src/proxy.js";

test("has the initial value on initialize", () => {
  const s = proxy(1);

  expect(s.value).toBe(1);
});

test("has the new value after set", () => {
  const s = proxy(1);

  s.value = 2;

  expect(s.value).toBe(2);
});

test("detects nested changes and calls the listener with the new value", () => {
  const s = proxy({
    a: 1,
    b: {
      c: 2,
    },
  });
  const listener = vi.fn();

  s.subscribe(listener);

  s.value.a = 2;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({ a: 2, b: { c: 2 } });

  s.value.b.c = 10;

  expect(listener).toHaveBeenCalledTimes(2);
  expect(listener).toHaveBeenCalledWith({ a: 2, b: { c: 10 } });
});

test("nested values are updated", () => {
  const s = proxy({
    a: 1,
    b: {
      c: 2,
    },
  });

  s.value.a = 2;

  expect(s.value.a).toBe(2);
  expect(s.value.b.c).toBe(2);

  s.value.b.c = 10;

  expect(s.value.a).toBe(2);
  expect(s.value.b.c).toBe(10);
});

test("preserves object references", () => {
  const original = { a: { b: 1 } };
  const s = proxy(original);

  expect(proxy.get(s.value)).toBe(original);
  expect(proxy.get(s.value.a)).toBe(original.a);
  expect(proxy.get(s.value.a.b)).toBe(original.a.b);
});

test("preserves object references on original objects", () => {
  const original = {
    a: {
      d: 34,
    },
    b: {
      c: 2,
    },
  };

  const p = proxy(original);

  expect(proxy.get(p.value)).toBe(original);
  expect(proxy.get(p.value.a)).toBe(original.a);
  expect(proxy.get(p.value.b)).toBe(original.b);
});

test("preserves object reference on non changed paths", () => {
  const original = {
    a: {
      d: 34,
    },
    b: {
      c: 2,
    },
  };

  const s = proxy(original);

  s.value.a.d = 123;

  expect(proxy.get(s.value.a)).not.toBe(original.a);
  expect(proxy.get(s.value.b)).toBe(original.b);
});

test("does not call the listener when the value does not change", () => {
  const s = proxy({ a: 1 });
  const listener = vi.fn();

  s.subscribe(listener);

  s.value.a = 1;

  expect(listener).not.toHaveBeenCalled();
});

describe("arrays", () => {
  test("works with arrays", () => {
    const original = [1, 2, 3];

    const s = proxy(original);

    expect(proxy.get(s.value)).toBe(original);

    s.value[0] = 2;

    expect(proxy.get(s.value)).not.toBe(original);

    expect(s.value[0]).toBe(2);

    const array = proxy.get(s.value);

    expect(Array.isArray(array)).toBe(true);
    expect(array).toEqual(expect.arrayContaining([2, 2, 3]));
  });

  test("array length assignment works fine", () => {
    const original = [1, 2, 3, 4, 5];
    const s = proxy(original);

    s.value.length = 2;

    expect(Array.isArray(s.value)).toBe(true);
    expect(s.value).not.toEqual(original);
    expect(s.value).toEqual([1, 2]);

    s.value.length = 5;

    expect(Array.isArray(s.value)).toBe(true);
    expect(proxy.get(s.value)).not.toEqual(original);
    expect(proxy.get(s.value)).toEqual([1, 2, undefined, undefined, undefined]);
  });

  describe("array methods", () => {
    test.each([
      ["push", [1, 2, 3, 4, 5], [6], [1, 2, 3, 4, 5, 6], 6],
      ["pop", [1, 2, 3, 4, 5], [], [1, 2, 3, 4], 5],
      ["shift", [1, 2, 3, 4, 5], [], [2, 3, 4, 5], 1],
      ["unshift", [1, 2, 3, 4, 5], [6], [6, 1, 2, 3, 4, 5], 6],
      ["splice", [1, 2, 3, 4, 5], [1, 2], [1, 4, 5], [2, 3]],
      ["splice", [1, 2, 3, 4, 5], [1, 2, 6, 7], [1, 6, 7, 4, 5], [2, 3]],
      [
        "sort",
        ["b", "d", "a", "c"],
        [],
        ["a", "b", "c", "d"],
        ["a", "b", "c", "d"],
      ],
    ])(
      "array %s behaves immutably",
      (method, original, args, expected, expectedReturn) => {
        const s = proxy(original);

        const ret = (s.value as any)[method](...args);

        expect(Array.isArray(s.value)).toBe(true);
        expect(proxy.get(s.value)).not.toEqual(original);
        expect(proxy.get(s.value)).toEqual(expected);
        expect(ret).toEqual(expectedReturn);
      }
    );
  });

  test("array methods should call the listener only once", () => {
    const original = [1, 2, 3, 4, 5];
    const s = proxy(original);

    const listener = vi.fn();
    s.subscribe(listener);

    s.value.splice(1, 3, 6, 7);

    expect(listener).toHaveBeenCalledTimes(1);

    s.value.push(8, 9, 10, 11);

    expect(listener).toHaveBeenCalledTimes(2);

    s.value.sort();

    expect(listener).toHaveBeenCalledTimes(3);
  });

  test("array with nested objects", () => {
    const original = [{ a: 1 }, { a: 2 }, { a: 3 }];
    const s = proxy(original);

    const listener = vi.fn();
    s.subscribe(listener);

    s.value[0].a = 2;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([{ a: 2 }, { a: 2 }, { a: 3 }]);

    expect(proxy.get(s.value[1])).toBe(original[1]);
    expect(proxy.get(s.value[2])).toBe(original[2]);
  });
});
