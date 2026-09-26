import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
    unique: true,
  },

  title: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },
});

const Group = mongoose.model("Group", groupSchema);

export default Group;