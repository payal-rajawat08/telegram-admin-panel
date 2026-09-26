import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  messageId: {
    type: Number,
    required: true,
  },

  sender: {
    type: String,
    required: true,
  },

  chatId: {
    type: Number,
    required: true,
  },

  chatTitle: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    default: "",
  },

  date: {
    type: Date,
    required: true,
  },

  mediaType: {
    type: String,
    default: null,
  },

  fileName: {
    type: String,
    default: null,
  },

  fileId: {
    type: String,
    default: null,
  },
});

messageSchema.index(
  { chatId: 1, messageId: 1 },
  { unique: true }
);

const Messages = mongoose.model("Messages", messageSchema);

export default Messages;