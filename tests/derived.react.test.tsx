/**
 * @vitest-environment jsdom
 */
import { expect, test } from "vitest";
import { derived } from "../src/react";
import { render, act } from "@testing-library/react";
import { cloneElement } from "react";
import { signal } from "../src/signal";

test("renders correctly", async () => {
  const s = signal(1);
  const d = derived(s, (v) => v * 10);

  const { baseElement } = render(d);

  expect(baseElement).toHaveTextContent("10");
});

test("updates the value", async () => {
  const s = signal(1);
  const d = derived(s, (v) => v * 10);

  const { baseElement } = render(d);

  act(() => {
    s.value = 2;
  });

  expect(baseElement).toHaveTextContent("20");
});

test("renders with other elements", () => {
  const s = signal("Hello World");
  const d = derived(s, (v) => v + "!");
  const { baseElement } = render(
    <div>
      <h1>My App</h1>
      <p>Message: {d}</p>
    </div>
  );

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello World!</p>"
  );
});

test("keeps working if cloneElement is used", () => {
  const s = signal("Hello World");
  const d = derived(s, (v) => v + "!");
  const { baseElement } = render(
    <div>
      <h1>My App</h1>
      <p>Message: {cloneElement(d)}</p>
    </div>
  );

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello World!</p>"
  );

  act(() => {
    s.value = "Hello React";
  });

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello React!</p>"
  );
});
