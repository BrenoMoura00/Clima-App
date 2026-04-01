type ChatMessageProps = {
  text: string;
  sender: "user" | "bot";
};

export default function ChatMessage({ text, sender }: ChatMessageProps) {
  const isUser = sender === "user";

  return (
    <div
      className={`w-full flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-2`}
    >
      <div
        className={`max-w-[75%] p-2 rounded-lg text-sm ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-900"
        }`}
      >
        {text}
      </div>
    </div>
  );
}