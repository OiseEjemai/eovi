import { useEffect, useState } from "react";

const BOT_TOKEN = "7607070892:AAHpEZTffDinbGt2GO4ikIAWWk4BK0T9e84";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

function TelegramBot() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch(`${TELEGRAM_API}/getUpdates`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
          const lastMessage = data.result[data.result.length - 1].message;
          if (lastMessage.text === "/start") {
            const chatId = lastMessage.chat.id;
            sendMessage(chatId);
          }
        }
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    };

    const sendMessage = async (chatId: any) => {
      const text = "Hello! Welcome to my bot.";
      const url = `${TELEGRAM_API}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;

      try {
        await fetch(url);
        setMessage("Message sent successfully!");
      } catch (error) {
        setMessage("Error sending message.");
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(fetchUpdates, 3000);
    return () => clearInterval(interval);
  }, []);

  return <div>{message}</div>;
}

export default TelegramBot;