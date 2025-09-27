import dotenv from "dotenv";
dotenv.config({
  quiet: true,
});
import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { z } from "zod";

const server = new FastMCP({
  name: "CalDAV MCP",
  version: VERSION,
  authenticate: async (request) => {
    if (!process.env.API_KEY || !request) {
      return { id: "user" };
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
  name: "hello_world",
  parameters: z.object({
    name: z.string(),
  }),
  execute: async (args, ctx) => {
    return "";
  },
});

let transport: "httpStream" | "stdio" = "stdio";
if (process.env.TRANSPORT === "http") {
  transport = "httpStream";
}
if (process.argv[2] === "--http") {
  transport = "httpStream";
}
server.start({
  transportType: transport,
  httpStream: {
    port: 8080,
  },
});
