import { sendMessage } from "../telegram/telegramService.js";
import Messages from "../models/Message.js";

const replyToTelegram = async (req,res) => {
    const {text} = req.body;
    if(!text){
       return res.status(400).json({
            message:"message text is required"
        });
    }
    await sendMessage(text);
    res.status(200).json({
        message:"reply sent successfully"
    });
};

const getMessages = async (req,res) => {
    const messages = await Messages.find().sort({date:-1}).limit(100);
    res.status(200).json({
        messages
    });
};

export { replyToTelegram, getMessages };
