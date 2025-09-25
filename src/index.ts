import dotenv from "dotenv";
dotenv.config();
import createServer from "./server";

const server = createServer();

server.start({
  transportType: "httpStream",
  httpStream: {
    port: 8080,
  },
});