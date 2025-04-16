
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import GroupSettingsModal from "./group-settings-modal";
import { sendMessage, fetchMessages, subscribeToGroupMessages } from "@/services/travel-group-service";
import { GroupMessage } from "@/types/travel-group-types";

// Import components
import ChatHeader from "./group-chat/chat-header";
import ChatInput from "./group-chat/chat-input";
import ChatMessagesContainer from "./group-chat/chat-messages-container";

interface GroupMemberInfo {
  id: string;
  name: string;
  avatar: string;
  isCreator: boolean;
}

interface TravelGroupChatProps {
  groupId: string;
  groupName: string;
  groupMembers: GroupMemberInfo[];
  currentUserId?: string;
  isCreator: boolean;
  onRefreshMembers?: () => Promise<void>;
}

const TravelGroupChat = ({
  groupId,
  groupName,
  groupMembers,
  currentUserId,
  isCreator,
  onRefreshMembers
}: TravelGroupChatProps) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { toast } = useToast();
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  
  // Load messages when the component mounts
  useEffect(() => {
    if (!groupId) return;
    
    // Load initial messages
    loadMessages();
    
    // Set up real-time subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    
    subscriptionRef.current = subscribeToGroupMessages(groupId, (newMessage) => {
      console.log("New message received:", newMessage);
      setMessages(current => {
        // Check if the message is already in our state to avoid duplicates
        const exists = current.some(msg => msg.id === newMessage.id);
        if (exists) {
          return current;
        }
        return [...current, newMessage];
      });
    });
    
    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [groupId]);
  
  const loadMessages = async () => {
    if (!groupId) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching messages for group:", groupId);
      const loadedMessages = await fetchMessages(groupId);
      console.log("Loaded messages:", loadedMessages.length);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (message: string, mediaUrl?: string) => {
    if (!currentUserId || !groupId) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Sending message to group:", groupId);
      await sendMessage(groupId, message, mediaUrl);
      // Don't need to reload messages since we have real-time subscription
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      // Try to reload messages in case subscription failed
      await loadMessages();
    } finally {
      setIsLoading(false);
    }
  };
  
  const getMemberName = (userId: string) => {
    const member = groupMembers.find(m => m.id === userId);
    return member?.name || "Unknown User";
  };
  
  const getMemberAvatar = (userId: string) => {
    const member = groupMembers.find(m => m.id === userId);
    return member?.avatar || "";
  };
  
  const handleGroupSettingsUpdate = async () => {
    toast({
      title: "Group Updated",
      description: "Group settings have been updated successfully",
    });
    if (onRefreshMembers) {
      await onRefreshMembers();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ChatHeader 
        groupName={groupName} 
        memberCount={groupMembers.length}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      
      <ChatMessagesContainer
        messages={messages}
        currentUserId={currentUserId}
        getMemberName={getMemberName}
        getMemberAvatar={getMemberAvatar}
        isLoading={isLoading && messages.length === 0}
      />
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        groupId={groupId}
      />

      {isSettingsModalOpen && groupId && (
        <GroupSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          group={{
            id: groupId,
            title: groupName,
            description: "",
            destination: "",
            creator_id: groupMembers.find(m => m.isCreator)?.id || "",
            is_public: true,
            // Minimal props needed for the modal
            capacity: groupMembers.length,
            created_at: "",
            is_influencer_trip: false,
          }}
          members={groupMembers.map(member => ({
            id: `member-${member.id}`,
            user_id: member.id,
            group_id: groupId,
            joined_at: "",
            role: member.isCreator ? "creator" : "member",
            profile: {
              id: member.id,
              fullName: member.name,
              avatarUrl: member.avatar,
              email: "",
              createdAt: ""
            }
          }))}
          onUpdate={handleGroupSettingsUpdate}
          isCreator={isCreator}
        />
      )}
    </div>
  );
};

export default TravelGroupChat;
