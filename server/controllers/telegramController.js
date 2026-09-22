import { sendMessage } from "../telegram/telegramService";
const replyToTelegram = async (eq,res) => {
    const {text} = req.body;
    if(!text){
       return res.status(400).json({
            message:"message text is required"
        });
    }
    await sendMessage(text);
    es.status(200).json({
        message:"reply sent successfully"
    });
}