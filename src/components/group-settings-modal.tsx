
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TravelGroup, GroupMember } from "@/types/travel-group-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Settings,
  Download,
  Shield,
  Lock,
  Globe,
  UserPlus,
  UserX,
  X,
  Save,
  Copy,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateGroupSettings, inviteUserToGroup } from "@/services/travel-group-service";
import { useAuth } from "@/contexts/AuthContext";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: TravelGroup;
  members: GroupMember[];
  onUpdate: () => void;
  isCreator: boolean;
}

const GroupSettingsModal = ({
  isOpen,
  onClose,
  group,
  members,
  onUpdate,
  isCreator
}: GroupSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [title, setTitle] = useState(group.title);
  const [description, setDescription] = useState(group.description || "");
  const [destination, setDestination] = useState(group.destination);
  const [imageUrl, setImageUrl] = useState(group.image_url || "");
  const [isPublic, setIsPublic] = useState(group.is_public);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleUpdateGroup = async () => {
    try {
      setIsLoading(true);
      await updateGroupSettings(group.id, {
        title,
        description,
        destination,
        image_url: imageUrl,
        is_public: isPublic
      });
      
      toast({
        title: "Success!",
        description: "Group settings updated successfully",
      });
      onUpdate();
      
    } catch (error) {
      console.error("Error updating group settings:", error);
      toast({
        title: "Error",
        description: "Failed to update group settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !validateEmail(inviteEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setInviteStatus('sending');
    setInviteMessage("Sending invitation...");

    try {
      await inviteUserToGroup(group.id, inviteEmail);
      
      setInviteStatus('success');
      setInviteMessage(`Invitation sent to ${inviteEmail}`);
      
      toast({
        title: "Invitation Sent!",
        description: `Invitation email sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      
      // Reset status after a delay
      setTimeout(() => {
        setInviteStatus('idle');
        setInviteMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error inviting member:", error);
      setInviteStatus('error');
      setInviteMessage("Failed to send invitation");
      
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    }
  };

  const generateInviteLink = () => {
    // For security reasons, we don't generate public invite links
    // Instead, direct users to send email invitations
    toast({
      title: "Email Invites",
      description: "For security reasons, please use email invitations instead of public links.",
    });
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
    } else {
      generateInviteLink();
      setTimeout(() => {
        navigator.clipboard.writeText(inviteLink);
        toast({
          title: "Copied!",
          description: "Invite link copied to clipboard",
        });
      }, 100);
    }
  };

  const exportChat = () => {
    toast({
      title: "Coming Soon",
      description: "Chat export functionality will be available in the next update",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Group Settings</DialogTitle>
          <DialogDescription>
            Manage group settings, members, and privacy options
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="general" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex gap-2 items-center">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex gap-2 items-center">
              <Shield className="h-4 w-4" />
              <span>Privacy & Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Group Name</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isCreator}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input 
                id="destination" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                disabled={!isCreator}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={!isCreator}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Group Image URL</Label>
              <Input 
                id="imageUrl" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={!isCreator}
              />
            </div>
            
            {isCreator && (
              <div className="flex justify-end mt-4">
                <Button onClick={handleUpdateGroup} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-trypie-600" />
                Invite New Members
              </h3>
              
              <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="inviteEmail" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                      className="flex-1"
                      disabled={inviteStatus === 'sending'}
                    />
                    <Button 
                      onClick={handleInviteMember} 
                      disabled={!inviteEmail || inviteStatus === 'sending'}
                    >
                      {inviteStatus === 'sending' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send
                    </Button>
                  </div>
                  
                  {inviteStatus !== 'idle' && (
                    <div className={`mt-2 text-sm flex items-center gap-1 ${
                      inviteStatus === 'success' ? 'text-green-600' : 
                      inviteStatus === 'error' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {inviteStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                      {inviteStatus === 'error' && <AlertCircle className="h-4 w-4" />}
                      {inviteStatus === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{inviteMessage}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Email invitations</span> are the recommended and most secure way to invite people to your travel group.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-trypie-600" />
                Group Members ({members.length})
              </h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarImage src={member.profile?.avatarUrl} alt={member.profile?.fullName || "Member"} />
                        <AvatarFallback>{member.profile?.fullName?.substring(0, 2) || "ME"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.profile?.fullName || "Anonymous User"}</p>
                        <p className="text-xs text-muted-foreground">{member.role || "member"}</p>
                      </div>
                    </div>
                    
                    {isCreator && member.user_id !== user?.id && (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Group Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Control who can find and join your group
                  </p>
                </div>
                
                <div className="flex gap-2 items-center">
                  <RadioGroup 
                    value={isPublic ? "public" : "private"}
                    onValueChange={(value) => setIsPublic(value === "public")}
                    className="flex gap-4"
                    disabled={!isCreator}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="flex items-center gap-1">
                        <Globe className="h-4 w-4" /> Public
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private" className="flex items-center gap-1">
                        <Lock className="h-4 w-4" /> Private
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <h3 className="font-medium">Approve Join Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Manually approve members before they can join (private groups only)
                  </p>
                </div>
                <Switch 
                  disabled={isPublic || !isCreator} 
                  checked={!isPublic}
                />
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <h3 className="font-medium">Encrypted Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable end-to-end encryption for all messages (coming soon)
                  </p>
                </div>
                <Switch disabled />
              </div>
              
              {isCreator && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <h3 className="font-medium">Export Chat History</h3>
                    <p className="text-sm text-muted-foreground">
                      Download all chat messages as a text file
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportChat} className="flex gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          
          {activeTab !== "general" && isCreator && (
            <Button onClick={handleUpdateGroup} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsModal;
