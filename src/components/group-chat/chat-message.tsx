
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GroupMessage } from "@/types/travel-group-types";

interface ChatMessageProps {
  message: GroupMessage;
  currentUserId?: string;
  memberName: string;
  memberAvatar: string;
}

const ChatMessage = ({ message, currentUserId, memberName, memberAvatar }: ChatMessageProps) => {
  const isSender = message.user_id === currentUserId;

  const formatMentions = (text: string) => {
    const regex = /@([a-zA-Z0-9_]+)/g;
    return text.replace(regex, '<span class="text-blue-600 font-medium">$&</span>');
  };

  const formattedMessage = formatMentions(message.message);

  return (
    <div 
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isSender && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={memberAvatar} alt={memberName} />
          <AvatarFallback>{memberName.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isSender ? 'bg-trypie-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg px-4 py-2`}>
        {!isSender && (
          <p className="text-xs font-semibold mb-1">{memberName}</p>
        )}
        <div 
          dangerouslySetInnerHTML={{ __html: formattedMessage }} 
          className="text-sm"
        />
        {message.media_url && (
          <div className="mt-2">
            <img 
              src={message.media_url} 
              alt="Shared media" 
              className="rounded-md max-h-60 object-contain"
              onLoad={() => {
                // Scroll to bottom when image loads
                const messagesEnd = document.getElementById("messages-end");
                messagesEnd?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        )}
        <p className="text-xs opacity-70 text-right mt-1">
          {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
      
      {isSender && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={memberAvatar} alt={memberName} />
          <AvatarFallback>{memberName.substring(0, 2)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
