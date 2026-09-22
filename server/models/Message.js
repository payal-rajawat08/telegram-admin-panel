import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    messageId:{
        type:Number,
        required:true,
        unique:true
    },
    sender:{
        type:String,
        required:true
    },
    chatId:{
        type:Number,
        required:true

    },
    text:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    }
});
const Messages = mongoose.model("Messages",messageSchema);
export default Messages;