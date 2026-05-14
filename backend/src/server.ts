import cors from "cors";
import express from "express";
import helmet from "helmet";
import http from "http";
import path from "path";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { clientOrigins, env } from "./env.js";
import { prisma } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: clientOrigins, credentials: true }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 240 }));
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("presence:online", async ({ userId }) => {
    socket.data.userId = userId;
    if (userId) await prisma.user.update({ where: { id: userId }, data: { online: true } }).catch(() => null);
    io.emit("presence:update", { userId, online: true });
  });

  socket.on("room:join", (room) => socket.join(room));
  socket.on("typing", (payload) => socket.to(payload.room ?? "general").emit("typing", payload));
  socket.on("message:send", async (payload) => {
    const message = await prisma.message.create({
      data: {
        content: payload.content,
        room: payload.room ?? "general",
        senderId: payload.senderId,
        departmentId: payload.departmentId
      },
      include: { sender: { select: { id: true, name: true, email: true, online: true } } }
    });
    io.to(payload.room ?? "general").emit("message:new", message);
  });

  socket.on("file:changed", (payload) => io.emit("file:sync", payload));
  socket.on("notification:new", (payload) => io.emit("notification:new", payload));
  socket.on("activity:new", (payload) => io.emit("activity:new", payload));

  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    if (userId) await prisma.user.update({ where: { id: userId }, data: { online: false } }).catch(() => null);
    io.emit("presence:update", { userId, online: false });
  });
});

server.listen(env.PORT, () => {
  console.log(`API and realtime server running on http://localhost:${env.PORT}`);
});
