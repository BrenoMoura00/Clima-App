import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() === "") return;
    onSend(text);
    setText("");
  };

  return (
    <div className="flex gap-2 w-full mt-2">
      <input
        type="text"
        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#6D3DB3] focus:bg-white/10 transition-all shadow-inner text-sm"
        placeholder="Pergunte algo sobre o clima..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        className="bg-[#6D3DB3] hover:bg-purple-600 text-white font-medium px-5 py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center text-sm"
      >
        Enviar
      </button>
    </div>
  );
}