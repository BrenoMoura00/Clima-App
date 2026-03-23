import { useState } from "react";

type ChatInputProps = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t">
      <input
        type="text"
        className="flex-1 p-2 border rounded"
        placeholder="Digite uma mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Enviar
      </button>
    </form>
  );
}