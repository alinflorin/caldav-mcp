import dotenv from "dotenv";
dotenv.config({
    quiet: true
});
import createServer from "./server";

const server = createServer();
server.start({transportType: "stdio"});