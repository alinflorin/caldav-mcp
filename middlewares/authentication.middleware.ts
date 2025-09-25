import {IncomingMessage} from 'http';

export default async function authenticationMiddleware(request: IncomingMessage) {
    if (!process.env.API_KEY) {
      return {id: "user"};
    }
    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }
    return {
      id: "user",
    };
  }