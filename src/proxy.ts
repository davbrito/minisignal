import type { Signal } from "./signal.js";
import { signal } from "./signal.js";
import { invariant } from "./_internal/utils.js";

const GET_VALUE = Symbol("GET_VALUE");

const mutableArrayMethods: Record<string, boolean | undefined> = {
  splice: true,
  push: true,
  pop: true,
  shift: true,
  sort: true,
  reverse: true,
  unshift: true,
};

function objectDeepMutateObserverProxy<T>(
  obj: T,
  observer: (changedPath: (string | symbol | number)[], val: unknown) => void,
  path: (string | symbol | number)[] = []
): T {
  if (typeof obj !== "object" || obj === null) return obj;

  const proxy = new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === GET_VALUE) return obj;

      const value = Reflect.get(target, prop, receiver);

      if (typeof prop === "symbol") return value;

      if (Array.isArray(target) && mutableArrayMethods[prop]) {
        return (...args: unknown[]) => {
          const result = Array.from(target) as any;
          const returnValue = (value as Function).apply(result, args);
          observer([], result);
          return returnValue;
        };
      }

      if (typeof value !== "object" || value === null) {
        return value;
      }

      return objectDeepMutateObserverProxy(value, observer, [...path, prop]);
    },
    set(target, prop, newValue, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      if (oldValue === newValue) {
        return Reflect.set(target, prop, newValue, receiver);
      }
      observer([...path, prop], newValue);
      return true;
    },
  });

  return proxy;
}

export function proxy<T>(initialValue: T): Signal<T> {
  const sig = signal(initialValue);

  return Object.freeze({
    ...sig,
    get value() {
      return objectDeepMutateObserverProxy(
        sig.value,
        (changedPath, newValue) => {
          const prev = sig.value;
          invariant(
            typeof prev === "object" && prev !== null,
            "prev must be an object"
          );
          sig.value = getNewObj(prev, changedPath, newValue);
        }
      );
    },
    set value(newValue) {
      sig.value = newValue;
    },
  });
}

/**
 * This is a helper function to get the original value from a proxy.
 *
 * This is useful when you want to compare the value by reference.
 * Use this with caution, as it can be used to mutate the original value.
 */
proxy.get = function <T>(value: unknown): T {
  if (typeof value !== "object" || value === null) {
    return value as T;
  }

  return (value as Record<string | symbol, unknown>)[GET_VALUE] as T;
};

function getNewObj<T extends object>(
  prev: T,
  path: (string | symbol | number)[],
  newValue: unknown
): T {
  if (path.length === 0) return newValue as T;

  const [prop, ...rest] = path;

  const value = rest.length
    ? getNewObj((prev as Record<string | symbol, object>)[prop], rest, newValue)
    : newValue;

  if (Array.isArray(prev)) {
    const newArray = Array.from(prev);
    newArray[prop as any] = value;
    return newArray as T;
  }

  return { ...prev, [prop]: value };
}
