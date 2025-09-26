import dotenv from "dotenv";
dotenv.config({
    quiet: true
});
import createServer from "./server";

const server = createServer();

let transport: 'httpStream' | 'stdio' = 'stdio';
if (process.env.TRANSPORT === 'http') {
    transport = 'httpStream';
}
if (process.argv[2] === '--http') {
    transport = 'httpStream';
}
server.start({
  transportType: transport,
  httpStream: {
    port: 8080,
  },
});