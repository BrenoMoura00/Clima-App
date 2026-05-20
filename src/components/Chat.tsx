import { useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);

  function handleSend(text: string) {
    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);

    const botMsg: Message = {
      id: Date.now() + 1,
      text: "Resposta automática (substituir pela API depois)",
      sender: "bot",
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  }

  return (
    <div className="w-full h-full flex flex-col max-w-lg mx-auto border rounded-lg shadow">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m) => (
          <ChatMessage key={m.id} text={m.text} sender={m.sender} />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}