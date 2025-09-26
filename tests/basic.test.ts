import { describe, it, expect } from "vitest";
import { setupClient } from "./client.helper";

describe("Basic Server tests", () => {
  it("should connect", async () => {
    const client = await setupClient();
    expect(client).toBeDefined();
    console.log(process.env);
    await client.close();
  });
  it("should list tools", async () => {
    const client = await setupClient();
    const tools = await client.getAllTools();
    expect(tools).toBeDefined();
    expect(tools.length).toBeGreaterThan(0);
    await client.close();
  });
});
