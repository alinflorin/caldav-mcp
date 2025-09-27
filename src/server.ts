import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { z } from "zod";

export const createServer = () => {
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

  return server;
};

export default createServer;