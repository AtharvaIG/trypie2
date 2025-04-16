
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, mediaUrl?: string) => Promise<void>;
  isLoading: boolean;
  groupId: string;
}

const ChatInput = ({ onSendMessage, isLoading, groupId }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if ((!message.trim() && !uploadedFileUrl) || isLoading) return;
    
    try {
      await onSendMessage(message, uploadedFileUrl || undefined);
      setMessage("");
      setPreviewImage(null);
      setUploadedFileUrl(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // Upload to Supabase Storage
    setIsUploading(true);
    
    try {
      // Create a unique filename using timestamp and original file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `group-chats/${groupId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);
      
      setUploadedFileUrl(urlData.publicUrl);
      
      toast({
        title: "Upload complete",
        description: "Image ready to send",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      
      // Clear preview
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUploadedFileUrl(null);
  };

  return (
    <div className="px-4 py-3 border-t">
      {previewImage && (
        <div className="mb-2 relative w-24 h-24">
          <img 
            src={previewImage} 
            alt="Upload preview" 
            className="w-full h-full object-cover rounded-md"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-0 right-0 h-6 w-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0" 
            title="Add image"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0" 
            title="Attach file"
            disabled={true}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </div>
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[40px] max-h-[120px] flex-1"
          rows={1}
          disabled={isLoading || isUploading}
        />
        <Button 
          onClick={handleSend} 
          disabled={((!message.trim() && !uploadedFileUrl) || isLoading || isUploading)}
          className={cn(
            "shrink-0",
            (isLoading || isUploading) ? "opacity-70 cursor-not-allowed" : ""
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
