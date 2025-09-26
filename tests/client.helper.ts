import { MCPClient } from "mcp-client";

export const setupClient = async () => {
  const client = new MCPClient({
    name: "test",
    version: "1.0.0",
  });
  await client.connect({
    type: "stdio",
    args: ["run", "start:stdio:once"],
    command: "npm",
    env: {
      TRANSPORT: "stdio",
      ...process.env,
    },
  });
  return client;
};
