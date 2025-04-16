
import React from "react";
import { MoreVertical, Edit, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ChatHeaderProps {
  groupName: string;
  memberCount: number;
  onOpenSettings: () => void;
}

const ChatHeader = ({ groupName, memberCount, onOpenSettings }: ChatHeaderProps) => {
  return (
    <div className="px-4 py-3 border-b flex items-center justify-between">
      <div className="flex items-center">
        <div className="font-medium text-lg">{groupName}</div>
        <div className="text-sm text-gray-500 ml-2">({memberCount} members)</div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="flex items-center cursor-pointer" onClick={onOpenSettings}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Group Info
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer" onClick={onOpenSettings}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center cursor-pointer" onClick={onOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Group Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
