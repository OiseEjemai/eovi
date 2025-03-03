import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

const App = () => {
  const BOT_TOKEN = "7607070892:AAHpEZTffDinbGt2GO4ikIAWWk4BK0T9e84";
  const [chatId, setChatId] = useState<number | null>(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();

    // Extract chat_id from Telegram Web App data
    const userData = WebApp.initDataUnsafe;
    if (userData && userData.user) {
      setChatId(userData.user.id);
    }
  }, []);

  // Function to send the Web App button
  const sendWebAppButton = async () => {
    if (!chatId) {
      alert("Chat ID not detected. Please start the bot in Telegram.");
      return;
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Click the button below to open the app.",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Open App", web_app: { url: WebApp.initDataUnsafe?.start_param || "https://eovi-social.vercel.app" } }],
          ],
        },
      }),
    });

    if (response.ok) {
      alert("Button sent! Check your Telegram.");
    } else {
      alert("Failed to send button.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Welcome to My Telegram Mini App</h1>
      <p className="mb-6 text-gray-300">Type <b>/start</b> in Telegram to get the button.</p>
      <button
        onClick={sendWebAppButton}
        className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Send Web App Button
      </button>
    </div>
  );
};

export default App;
