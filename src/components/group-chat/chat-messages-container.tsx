
import React from "react";
import { GroupMessage } from "@/types/travel-group-types";
import ChatMessage from "./chat-message";
import { Loader2 } from "lucide-react";

interface ChatMessagesContainerProps {
  messages: GroupMessage[];
  currentUserId?: string;
  getMemberName: (userId: string) => string;
  getMemberAvatar: (userId: string) => string;
  isLoading?: boolean;
}

const ChatMessagesContainer = ({ 
  messages,
  currentUserId,
  getMemberName,
  getMemberAvatar,
  isLoading
}: ChatMessagesContainerProps) => {
  // Ref for automatic scrolling to bottom
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow py-4 px-6 overflow-y-auto bg-gray-50">
      {isLoading ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              memberName={getMemberName(message.user_id)}
              memberAvatar={getMemberAvatar(message.user_id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatMessagesContainer;
