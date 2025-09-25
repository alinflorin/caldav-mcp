import dotenv from "dotenv"; dotenv.config();
import { FastMCP } from "fastmcp";
import { VERSION } from "./version";

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




await server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
    stateless: true
  },
});