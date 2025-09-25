import dotenv from "dotenv"; dotenv.config();
import { FastMCP } from "fastmcp";
import { VERSION } from "./version";
import { config } from "./config";
import authenticationMiddleware from "./middlewares/authentication.middleware";

const server = new FastMCP({
  name: "CalDAV MCP",
  version: VERSION,
  authenticate: authenticationMiddleware,
});

await server.start({
  transportType: "httpStream",
  httpStream: {
    port: config.PORT,
    stateless: true
  },
});