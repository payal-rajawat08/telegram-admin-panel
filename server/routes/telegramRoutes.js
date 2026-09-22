import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { replyToTelegram } from "../controllers/telegramController.js";
const router = express.Router();
router.post("/reply",authMiddleware,replyToTelegram);
export default router;