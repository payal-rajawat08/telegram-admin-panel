import express from "express";
// express() ko call karne par Express application create hoti hai.
import cors from "cors";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import { start as startTelegramPolling } from "./telegram/telegramService.js";
/*
Aur ye app hi aage:
routes handle karega
middleware use karega
requests receive karega
responses bhejega*/
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: "http://localhost:5173",
  },
});
app.set("io", io);
app.use(cors());
// jab react se backend ko json data jaega toh expresss ko read karna hoga us json data ko toh express.json vahi kar tha hai
// app.use()Ye Express mein middleware ko application ke saath register/use karne ka method hai.
app.use(express.json())
app.use("/api/auth",authRoutes);
app.use("/api/admin/",adminRoutes);
app.use("/api/telegram",telegramRoutes);
app.get("/",(req,res)=>{
    res.send("hello from server");
});
connectDB();
startTelegramPolling(io);
io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
  });
});

httpServer.listen(5001, () => {
  console.log("server is running on port 5001");
});
