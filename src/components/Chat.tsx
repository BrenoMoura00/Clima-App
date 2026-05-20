import { useState } from "react";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { api } from "../services/api";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

type ChatProps = {
  cidadeAtual?: string;
  climaAtual?: string;
};

export default function Chat({ cidadeAtual = "São Paulo", climaAtual = "25°C e limpo" }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  async function handleSend(text: string) {
    const userMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
    };
    
    setMessages((prev) => [...prev, userMsg]);

    const promptEnriquecido = `Você é um assistente virtual amigável especializado em turismo e clima. INFORMAÇÕES DE CONTEXTO: O usuário está atualmente na cidade de ${cidadeAtual} e o clima lá agora é de ${climaAtual}. Responda à seguinte pergunta do usuário levando em consideração estritamente a cidade em que ele está e o clima atual para dar a melhor recomendação possível. PERGUNTA DO USUÁRIO: "${text}"`;

    try {
      const response = await api.post('/ia', { text: promptEnriquecido });
      const botText = response.data.candidates[0].content.parts[0].text;

      const botMsg: Message = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
      };
      
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Desculpe, ocorreu um erro ao consultar a IA.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
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