# Contributing to minisignal

Thanks for your interest in contributing! 🎉

The following is a set of guidelines for contributing to minisignal. These are just guidelines, not rules — use your best judgment and feel free to propose changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project is governed by the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/minisignal.git
   cd minisignal
   ```

3. Install dependencies. minisignal uses [pnpm](https://pnpm.io/) — please ensure you have it installed:

   ```bash
   pnpm install
   ```

4. Create a branch for your changes:

   ```bash
   git checkout -b feat/my-feature
   ```

---

## Development

### Commands

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `pnpm test`          | Run the test suite (Vitest)                |
| `pnpm test:coverage` | Run tests with coverage report             |
| `pnpm build`         | Build all entry points (TypeScript + Vite) |
| `pnpm lint`          | Lint the codebase (ESLint)                 |

### Code Style

- **TypeScript** — The project is written in strict TypeScript. Maintain full type safety.
- **Formatting** — Code is formatted with [Prettier](https://prettier.io/). Run `pnpm lint` to check for issues.
- **No runtime dependencies** — Avoid adding external runtime dependencies. The library must remain zero-dependency.

### Testing

- All features must be covered by tests.
- We use [Vitest](https://vitest.dev/) as the test runner.
- Tests live in the `tests/` directory, mirroring the source structure.
- React-specific tests use `@testing-library/react` and `jsdom`.
- Run the full suite before opening a pull request:

  ```bash
  pnpm test
  ```

### Project Structure

```
minisignal/
├── src/                    # Source code
│   ├── signal.ts           # Core signal primitive
│   ├── derived.ts          # Derived (computed) signals
│   ├── effect.ts           # Side-effect scheduler
│   ├── proxy.ts            # Deep reactive proxy signals
│   ├── react.ts            # React integration
│   ├── index.ts            # Public entry point
│   └── _internal/          # Internal implementation details
│       ├── value.ts        # SignalValue class
│       ├── signals.ts      # DerivedSignal class
│       ├── consume.ts      # Dependency tracking (scope stack, tracker)
│       ├── batch.ts        # Batching and microtask flushing
│       └── utils.ts        # Shared utilities
├── tests/                  # Test suite
├── dist/                   # Build output (generated)
└── package.json
```

---

## Pull Requests

1. Ensure your code builds and all tests pass.
2. Update tests if you're adding or changing functionality.
3. Keep pull requests focused — one feature or fix per PR.
4. Write a clear, descriptive title and include a summary of changes.
5. Reference any related issues using GitHub keywords (e.g., `Closes #123`).

### PR Checklist

Before submitting, confirm your PR meets these requirements:

- [ ] Code compiles without errors (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] New code includes tests
- [ ] Linting passes (`pnpm lint`)
- [ ] Commit messages follow [conventional commits](https://www.conventionalcommits.org/)

---

## Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/davbrito/minisignal/issues). When filing a bug report, include:

- A clear, descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Code snippets or a minimal reproduction.
- Environment details (Node version, browser, etc.).

---

## Suggesting Features

Feature suggestions are welcome! Open a [GitHub issue](https://github.com/davbrito/minisignal/issues) with:

- A clear description of the feature and its motivation.
- Example usage or API design ideas.
- Any relevant context or use cases.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
