import express from "express";
// express() ko call karne par Express application create hoti hai.
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
/*
Aur ye app hi aage:
routes handle karega
middleware use karega
requests receive karega
responses bhejega*/
const app = express();
// jab react se backend ko json data jaega toh expresss ko read karna hoga us json data ko toh express.json vahi kar tha hai
// app.use()Ye Express mein middleware ko application ke saath register/use karne ka method hai.
app.use(express.json())
app.use("/api/auth",authRoutes);
app.use("/api/admin/",adminRoutes);
app.use("/api/admin/telegram/",telegramRoutes);
app.get("/",(req,res)=>{
    res.send("hello from server");
});
connectDB();
app.listen(5001,()=>{
    console.log("server is running on port 5001");
});
