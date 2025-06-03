import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import {
  userRouter,
  channelRouter,
  healthcheckRouter,
  tweetRouter,
  subscriptionRouter,
  videoRouter,
  commentRouter,
  likeRouter,
  playlistRouter,
  dashboardRouter,
} from "./routes/index.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Route map for dynamic registration
const routes = [
  { path: "/healthcheck", router: healthcheckRouter },
  { path: "/users", router: userRouter },
  { path: "/channels", router: channelRouter },
  { path: "/tweets", router: tweetRouter },
  { path: "/subscriptions", router: subscriptionRouter },
  { path: "/videos", router: videoRouter },
  { path: "/comments", router: commentRouter },
  { path: "/likes", router: likeRouter },
  { path: "/playlists", router: playlistRouter },
  { path: "/dashboard", router: dashboardRouter },
];

// Dynamic route registration
routes.forEach(({ path, router }) => {
  app.use(`/api/v1${path}`, router);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    // credentials: true,
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Emit socketId immediately on connection
  socket.emit("socketId", { socketId: socket.id });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    // Optionally, notify frontend to clear socketId
    socket.emit("socketDisconnected");
  });
});

export { app, server, io };
