# Shared Frontend Pages

This directory contains the main page components of the application. Each file typically represents a unique route or view.

## Structure

- Pages are responsible for laying out the high-level structure of a view.
- They fetch data using hooks from `src/hooks`.
- They compose smaller, reusable components from `src/components`.
- They should contain minimal business logic, as this is delegated to hooks. 