import { vi } from "vitest";

// Mock the server-only package, so it doesn't error out here talbmout client components
vi.mock("server-only", () => {
  return {};
});
