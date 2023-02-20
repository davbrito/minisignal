/**
 * @vitest-environment jsdom
 */
import { act, render } from "@testing-library/react";
import { cloneElement } from "react";
import { expect, test, vi } from "vitest";
import { signal } from "../src/react";

test("renders correctly", async () => {
  const s = signal(1);

  const { baseElement } = render(s);

  expect(baseElement).toHaveTextContent("1");
});

test("updates the value", async () => {
  const s = signal(1);

  const { baseElement } = render(s);

  await act(async () => {
    s.value = 2;
    await Promise.resolve();
  });

  expect(baseElement).toHaveTextContent("2");
});

test("renders with other elements", () => {
  const s = signal("Hello World");
  const { baseElement } = render(
    <div>
      <h1>My App</h1>
      <p>Message: {s}</p>
    </div>
  );

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello World</p>"
  );
});

test("keeps working if cloneElement is used", async () => {
  const s = signal("Hello World");
  const { baseElement } = render(
    <div>
      <h1>My App</h1>
      <p>Message: {cloneElement(s)}</p>
    </div>
  );

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello World</p>"
  );

  await act(async () => {
    s.value = "Hello React";
    await Promise.resolve();
  });

  expect(baseElement).toContainHTML(
    "<h1>My App</h1><p>Message: Hello React</p>"
  );
});

test("react signals are batched by default", async () => {
  const s = signal(1);
  const listener = vi.fn();
  s.subscribe(listener);

  const { baseElement } = render(s);

  act(() => {
    s.value++;
  });

  expect(baseElement).toHaveTextContent("1");

  act(() => {
    s.value++;
  });

  expect(baseElement).toHaveTextContent("1");

  await act(async () => {
    await Promise.resolve();
  });

  expect(baseElement).toHaveTextContent("3");
});
