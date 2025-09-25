import { describe, it, expect } from "vitest";
import createServer from "../src/server";

describe("Basic Server tests", () => {
  it("should initialize", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
