# Shared Frontend Hooks

This directory contains reusable React hooks that encapsulate business logic and state management for various features across the application.

## Principles

- **Single Responsibility:** Each hook should manage a single piece of state or a single side-effect.
- **Generic:** Hooks in this directory should be application-agnostic and not tied to a specific module's UI.
- **Testable:** All hooks should be tested in isolation to ensure their logic is correct. 