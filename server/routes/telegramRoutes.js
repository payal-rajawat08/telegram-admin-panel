import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { replyToTelegram, getMessages } from "../controllers/telegramController.js";
const router = express.Router();
router.post("/reply",authMiddleware,replyToTelegram);
router.get("/messages",authMiddleware,getMessages);
export default router;
