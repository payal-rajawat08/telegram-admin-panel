import dotenv from "dotenv";
import axios from "axios";
import Messages from "../models/Message.js";
dotenv.config();
const telegramApi = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
let lastUpdateId = 0;
const getBotInfo = async () => {
    const response = await axios.get(`${telegramApi}/getMe`);
    console.log(response.data);
};
const sendMessage = async (text) => {
    const response = await axios.post(`${telegramApi}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text
});
console.log(response.data);
};
const getUpdates = async ()=>{
    const response = await axios.get(`${telegramApi}/getUpdates`,{
    params: {
        offset: lastUpdateId + 1
    }
});
console.dir(response.data, { depth: null });
const groupMessages = response.data.result.filter(
    (update)=> update.message && update.message.text && update.message.chat.id.toString()===process.env.TELEGRAM_CHAT_ID
    );
const messages = groupMessages.map((update)=>({
    messageId : update.message.message_id,
    sender : update.message.from.first_name,
    chatId : update.message.chat.id,
    text : update.message.text,
    date : new Date(update.message.date*1000)
}));
for (const message of messages) {

    const existingMessage = await Messages.findOne({
        messageId: message.messageId
    });

    if (existingMessage) {
        continue;
    }

    const newMessage = new Messages(message);

    await newMessage.save();
}
 if (response.data.result.length > 0) {
        lastUpdateId =
            response.data.result[response.data.result.length - 1].update_id;
    }
console.dir(messages,{depth:null});
};
const start = async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
        console.log("Telegram polling skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set");
        return;
    }
    try {
        await getBotInfo();
        await getUpdates();
        setInterval(getUpdates, 3000);
    } catch (error) {
        console.log("Telegram polling failed to start", error.message);
    }
};

export { sendMessage, start };

