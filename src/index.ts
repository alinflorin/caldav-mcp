import dotenv from "dotenv";
dotenv.config();
import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { z } from "zod";

const server = new FastMCP({
  name: "CalDAV MCP",
  version: VERSION,
  authenticate: async (request) => {
    if (!process.env.API_KEY) {
      return {id: "user"};
    }
    const apiKey = request.headers["authorization"]?.replace("Bearer ", "");
    if (apiKey !== process.env.API_KEY) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }
    return {
      id: "user",
    };
  },
});


server.addTool({
  description: "A simple tool that returns a greeting message.",
  name: 'hello_world',
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true,
    streamingHint: false,
    title: 'Hello World Tool',
  },
  parameters: z.object({
    name: z.string(),
  }),
  execute: async (args, ctx) => {
    return `Hello, ${args.name}!`;
  },
});


server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    stateless: true
  },
});