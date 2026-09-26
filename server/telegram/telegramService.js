import dotenv from "dotenv";
import axios from "axios";
import Messages from "../models/Message.js";
import Group from "../models/Group.js";

dotenv.config();

const telegramApi = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

let lastUpdateId = 0;

const getBotInfo = async () => {
  const response = await axios.get(`${telegramApi}/getMe`);
  console.log(response.data);
};

const sendMessage = async (text, chatId, messageId) => {
  const payload = {
    chat_id: chatId,
    text: text,
  };

  if (messageId) {
    payload.reply_parameters = {
      message_id: messageId,
    };
  }

  const response = await axios.post(
    `${telegramApi}/sendMessage`,
    payload
  );

  console.log(response.data);

  return response.data.result;
};

const getUpdates = async (io) => {
  const response = await axios.get(`${telegramApi}/getUpdates`, {
    params: {
      offset: lastUpdateId + 1,

      // Explicitly receive messages + bot membership changes
      allowed_updates: ["message", "my_chat_member"],
    },
  });

  console.dir(response.data, { depth: null });

  /* =========================
     GROUP ADD / REMOVE
     ========================= */

  const groupUpdates = response.data.result.filter(
    (update) =>
      update.my_chat_member &&
      (update.my_chat_member.chat.type === "group" ||
        update.my_chat_member.chat.type === "supergroup")
  );

  for (const update of groupUpdates) {
    const chat = update.my_chat_member.chat;
    const status = update.my_chat_member.new_chat_member.status;

    // Bot is still a member
    if (
      status === "member" ||
      status === "administrator" ||
      (status === "restricted" &&
        update.my_chat_member.new_chat_member.is_member)
    ) {
      const savedGroup = await Group.findOneAndUpdate(
        { chatId: chat.id },
        {
          chatId: chat.id,
          title: chat.title,
          type: chat.type,
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      io.emit("newGroup", savedGroup);
    }

    // Bot left / was removed / kicked
    if (status === "left" || status === "kicked") {
      await Group.findOneAndDelete({
        chatId: chat.id,
      });

      io.emit("groupDeleted", chat.id);
    }
  }

  /* =========================
     NORMAL GROUP MESSAGES
     ========================= */

const groupMessages = response.data.result.filter(
  (update) =>
    update.message &&
    (update.message.chat.type === "group" ||
      update.message.chat.type === "supergroup")
);

const messages = groupMessages
  .map((update) => {
    const msg = update.message;

    // Text message
    if (msg.text) {
      return {
        messageId: msg.message_id,
        sender: msg.from?.first_name || "Unknown",
        chatId: msg.chat.id,
        chatTitle: msg.chat.title,
        text: msg.text,
        date: new Date(msg.date * 1000),
        mediaType: null,
        fileName: null,
        fileId: null,
      };
    }

    // Document / PDF / file
    if (msg.document) {
      return {
        messageId: msg.message_id,
        sender: msg.from?.first_name || "Unknown",
        chatId: msg.chat.id,
        chatTitle: msg.chat.title,
        text: msg.caption || "",
        date: new Date(msg.date * 1000),
        mediaType: "document",
        fileName: msg.document.file_name || "File",
        fileId: msg.document.file_id,
      };
    }

    // Photo
    if (msg.photo?.length) {
      const photo = msg.photo[msg.photo.length - 1];

      return {
        messageId: msg.message_id,
        sender: msg.from?.first_name || "Unknown",
        chatId: msg.chat.id,
        chatTitle: msg.chat.title,
        text: msg.caption || "",
        date: new Date(msg.date * 1000),
        mediaType: "photo",
        fileName: "Photo",
        fileId: photo.file_id,
      };
    }

    return null;
  })
  .filter(Boolean);
  for (const message of messages) {
    const existingMessage = await Messages.findOne({
      chatId: message.chatId,
      messageId: message.messageId,
    });

    if (existingMessage) {
      continue;
    }

    const newMessage = new Messages(message);

    await newMessage.save();

    io.emit("newMessage", message);
  }

  /* =========================
     UPDATE OFFSET
     ========================= */

  if (response.data.result.length > 0) {
    lastUpdateId =
      response.data.result[
        response.data.result.length - 1
      ].update_id;
  }

  console.dir(messages, { depth: null });
};

const start = async (io) => {
  if (
    !process.env.TELEGRAM_BOT_TOKEN ||
    !process.env.TELEGRAM_CHAT_ID
  ) {
    console.log(
      "Telegram polling skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set"
    );
    return;
  }

  try {
    await getBotInfo();
    await getUpdates(io);

    setInterval(() => getUpdates(io), 3000);
  } catch (error) {
    console.log(
      "Telegram polling failed to start",
      error.message
    );
  }
};

export { sendMessage, start };