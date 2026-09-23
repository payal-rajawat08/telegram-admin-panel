import { sendMessage } from "../telegram/telegramService.js";
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
}
export {replyToTelegram};