import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { config } from "./config";

const server = new FastMCP({
  name: "CalDAV MCP",
  version: VERSION,
});

await server.start({
  transportType: "httpStream",
  httpStream: {
    port: config.PORT,
    stateless: true
  },
});