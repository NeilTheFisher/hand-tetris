// fastify server
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from "@fastify/websocket";
import fastify from "fastify";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import type { WebSocket } from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const server = fastify({ logger: true });

const rooms: Record<string, WebSocket[]> = {};

export default async function setup() {
  server.register(fastifyStatic, {
    root: path.join(__dirname, "../dist"),
  });

  server.get("/", (req, reply) => {
    reply.sendFile("index.html", path.join(__dirname, "../dist"));
  });

  // 404
  server.setNotFoundHandler((req, reply) => {
    reply.sendFile("index.html", path.join(__dirname, "../dist"));
  });

  // add websocket that receives messages
  await server.register(fastifyWebsocket);

  server.get("/ws/:room", { websocket: true }, (connection, req) => {
    const room = (req.params as any).room;

    if (!rooms[room]) {
      rooms[room] = [connection.socket];
    } else {
      rooms[room].push(connection.socket);
    }

    for (const socket of rooms[room]) {
      if (socket === connection.socket) continue;

      socket.send("newPlayer");
    }

    connection.socket.on("message", (message) => {
      for (const socket of rooms[room]) {
        if (socket === connection.socket) continue;

        socket.send(message.toString());
      }
    });

    connection.socket.on("close", () => {
      rooms[room] = rooms[room].filter((s) => s !== connection.socket);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
    });

    connection.socket.on("error", () => {
      rooms[room] = rooms[room].filter((s) => s !== connection.socket);
      if (rooms[room].length === 0) {
        delete rooms[room];
      }
      connection.socket.close();
    });
  });

  // await server.register(FastifyVite, {
  //   root: path.join(__dirname, "../src"),
  //   dev: process.argv.includes("--dev"),
  // });

  // @ts-ignore
  // await server.vite.ready();

  // start server
  await server.listen({
    port: 3000,
    host: "0.0.0.0",
  });

  console.log(`Server listening on https://localhost:3000/`);
}

setup();
