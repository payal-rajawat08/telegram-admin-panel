import { sendMessage } from "../telegram/telegramService.js";
import Messages from "../models/Message.js";
import Group from "../models/Group.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const replyToTelegram = async (req, res) => {
  const { text, chatId, messageId } = req.body;
  if (!text) {
    return res.status(400).json({
      message: "message text is required"
    });
  }
  const sentMessage = await sendMessage(text, chatId, messageId);
  const savedMessage = await Messages.findOneAndUpdate(
  {
    chatId: sentMessage.chat.id,
    messageId: sentMessage.message_id,
  },
  {
    messageId: sentMessage.message_id,
    sender: "Telegram Support Bot",
    chatId: sentMessage.chat.id,
    chatTitle: sentMessage.chat.title || `Chat ${sentMessage.chat.id}`,
    text: sentMessage.text,
    date: new Date(sentMessage.date * 1000),
  },
  {
    upsert: true,
    returnDocument: "after",
  }
);
const io = req.app.get("io");

if (io) {
  io.emit("newMessage", savedMessage);
}
  res.status(200).json({
    message: "reply sent successfully"
  });
};
const getMessages = async (req, res) => {
  const messages = await Messages.find()
    .sort({ date: -1 })
    .limit(100);

  res.status(200).json({
    messages,
  });
};
const getGroups = async (req, res) => {
  const groups = await Group.find().sort({ title: 1 });

  res.status(200).json({
    groups,
  });
};
const getMedia = async (req, res) => {
  const { fileId } = req.params;

  try {
    const message = await Messages.findOne({ fileId });

    const fileResponse = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile`,
      {
        params: {
          file_id: fileId,
        },
      }
    );

    const filePath = fileResponse.data.result.file_path;

    const telegramFile = await axios.get(
      `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`,
      {
        responseType: "stream",
      }
    );

    const extension =
      message?.fileName?.split(".").pop().toLowerCase();

    const mimeTypes = {
      pdf: "application/pdf",

      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",

      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",

      mp3: "audio/mpeg",
      wav: "audio/wav",

      txt: "text/plain",
    };

    const contentType =
      mimeTypes[extension] ||
      telegramFile.headers["content-type"] ||
      "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", "inline");

    telegramFile.data.pipe(res);

  } catch (error) {
    console.error(
      "Media open failed:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "failed to open media",
    });
  }
};
const sendMedia = async (req, res) => {
  const { chatId } = req.body;

  if (!req.file) {
    return res.status(400).json({
      message: "file is required",
    });
  }

  if (!chatId) {
    return res.status(400).json({
      message: "chatId is required",
    });
  }

  try {
    const formData = new FormData();

    formData.append("chat_id", chatId);

    const file = new Blob([req.file.buffer], {
      type: req.file.mimetype,
    });

    formData.append("document", file, req.file.originalname);

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`,
      formData
    );

    const sentMessage = response.data.result;

    const savedMessage = await Messages.findOneAndUpdate(
      {
        chatId: sentMessage.chat.id,
        messageId: sentMessage.message_id,
      },
      {
        messageId: sentMessage.message_id,
        sender: "Telegram Support Bot",
        chatId: sentMessage.chat.id,
        chatTitle:
          sentMessage.chat.title || `Chat ${sentMessage.chat.id}`,
        text: "",
        date: new Date(sentMessage.date * 1000),
        mediaType: "document",
        fileName: req.file.originalname,
        fileId: sentMessage.document.file_id,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    const io = req.app.get("io");

    if (io) {
      io.emit("newMessage", savedMessage);
    }

    res.status(200).json({
      message: "media sent successfully",
      media: savedMessage,
    });
  } catch (error) {
    console.error(
      "Media send failed:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "failed to send media",
    });
  }
};
export { replyToTelegram, getMessages,getGroups,sendMedia,  getMedia,};
