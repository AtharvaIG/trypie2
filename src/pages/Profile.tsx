
import { useAuth } from "@/contexts/AuthContext";
import { StarIcon, PencilIcon, CameraIcon, ShieldIcon, ArrowLeft, Globe, Instagram, Twitter } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MyReviewsSection from "@/components/my-reviews-section";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetchUserProfile } from "@/hooks/use-profile";

const Profile = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile?.avatarUrl);
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  useEffect(() => {
    const loadExtendedProfile = async () => {
      if (!user) return;
      
      try {
        // Fetch extended profile data from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('bio, website_url, instagram_handle, twitter_handle, interests')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching extended profile:", error);
          return;
        }
        
        if (data) {
          setBio(data.bio || "");
          setWebsiteUrl(data.website_url || "");
          setInstagramHandle(data.instagram_handle || "");
          setTwitterHandle(data.twitter_handle || "");
          setInterests(data.interests || []);
        }
      } catch (error) {
        console.error("Error in loadExtendedProfile:", error);
      }
    };
    
    if (profile) {
      setFullName(profile.fullName || "");
      setAvatarUrl(profile.avatarUrl);
      loadExtendedProfile();
    }
  }, [profile, user]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl,
          bio: bio,
          website_url: websiteUrl,
          instagram_handle: instagramHandle,
          twitter_handle: twitterHandle,
          interests: interests
        })
        .eq('id', user.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Fetch updated profile to refresh context
      if (user.id) {
        const updatedProfile = await fetchUserProfile(user.id);
        console.log("Updated profile:", updatedProfile);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or GIF).",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create folder structure with user ID
      const folderPath = `${user.id}`;
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (error) throw error;
      
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setAvatarUrl(publicUrl.publicUrl);
      
      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded. Save your profile to apply changes.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const emailFormSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
    },
  });

  const handleEmailUpdate = async (values: z.infer<typeof emailFormSchema>) => {
    try {
      setIsUpdatingEmail(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: values.password,
      });
      
      if (signInError) throw signInError;
      
      const { error } = await supabase.auth.updateUser({
        email: values.email,
      });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check your new email to confirm the change.",
      });
      emailForm.reset({
        email: values.email,
        password: "",
      });
      setIsUpdatingEmail(false);
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Failed to update email",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      setIsUpdatingEmail(false);
    }
  };

  const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordUpdate = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsUpdatingPassword(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: values.currentPassword,
      });
      
      if (signInError) throw signInError;
      
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      passwordForm.reset();
      setIsUpdatingPassword(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Failed to update password",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsUpdatingPassword(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>
      
      {isAuthenticated && profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="profile" className="data-[state=active]:bg-trypie-50 data-[state=active]:text-trypie-600">
                  Profile Information
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-trypie-50 data-[state=active]:text-trypie-600">
                  Account Settings
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-trypie-50 data-[state=active]:text-trypie-600">
                  My Reviews
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="subtle-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>
                          Your personal information visible to other members
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        {isEditing ? (
                          <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="relative group">
                                <Avatar className="h-24 w-24 border-4 border-white shadow group-hover:opacity-75 transition-opacity">
                                  <AvatarImage src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} />
                                  <AvatarFallback>{fullName.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                
                                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                  <CameraIcon className="h-8 w-8 text-white" />
                                  <input 
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="sr-only" 
                                    onChange={handleAvatarChange}
                                    disabled={isUploading}
                                  />
                                </label>
                                
                                {isUploading && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 w-full">
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input 
                                      id="fullName"
                                      value={fullName}
                                      onChange={(e) => setFullName(e.target.value)}
                                      className="input-focused mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="bio">About Me</Label>
                              <Textarea 
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Share a bit about yourself and your travel style..."
                                className="mt-1 h-24"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="interests" className="mb-1 block">Travel Interests</Label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {interests.map((interest, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="px-3 py-1 flex items-center gap-1"
                                  >
                                    {interest}
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveInterest(interest)}
                                      className="ml-1 text-gray-500 hover:text-gray-700"
                                      aria-label={`Remove ${interest}`}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  id="newInterest"
                                  value={newInterest}
                                  onChange={(e) => setNewInterest(e.target.value)}
                                  placeholder="Add interest (e.g. Hiking, Food, Culture)"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddInterest();
                                    }
                                  }}
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={handleAddInterest}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-4 border-t pt-4">
                              <h3 className="font-medium text-sm text-gray-700">Social Links</h3>
                              
                              <div>
                                <Label htmlFor="websiteUrl" className="flex items-center gap-1">
                                  <Globe className="h-4 w-4" /> Website
                                </Label>
                                <Input
                                  id="websiteUrl"
                                  value={websiteUrl}
                                  onChange={(e) => setWebsiteUrl(e.target.value)}
                                  placeholder="https://yourwebsite.com"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="instagramHandle" className="flex items-center gap-1">
                                  <Instagram className="h-4 w-4" /> Instagram
                                </Label>
                                <Input
                                  id="instagramHandle"
                                  value={instagramHandle}
                                  onChange={(e) => setInstagramHandle(e.target.value)}
                                  placeholder="yourusername"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="twitterHandle" className="flex items-center gap-1">
                                  <Twitter className="h-4 w-4" /> Twitter
                                </Label>
                                <Input
                                  id="twitterHandle"
                                  value={twitterHandle}
                                  onChange={(e) => setTwitterHandle(e.target.value)}
                                  placeholder="yourusername"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                              <Avatar className="h-24 w-24 border-4 border-white shadow">
                                <AvatarImage src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=random`} />
                                <AvatarFallback>{(profile.fullName || 'User').substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-4 text-center sm:text-left">
                                <div>
                                  <h2 className="text-xl font-semibold">{profile.fullName}</h2>
                                  <p className="text-gray-600 mt-1">{user?.email}</p>
                                  <div className="flex items-center mt-2 justify-center sm:justify-start">
                                    <StarIcon className="text-yellow-500 mr-1" size={16} />
                                    <span className="text-sm">Gold Member</span>
                                  </div>
                                </div>
                                
                                {bio && (
                                  <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-900">About Me</h3>
                                    <p className="mt-1 text-gray-600">{bio}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {interests && interests.length > 0 && (
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Travel Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                  {interests.map((interest, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="px-3 py-1"
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {(websiteUrl || instagramHandle || twitterHandle) && (
                              <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Connect with me</h3>
                                <div className="flex flex-wrap gap-3">
                                  {websiteUrl && (
                                    <a 
                                      href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-trypie-600 hover:text-trypie-700"
                                    >
                                      <Globe className="h-4 w-4" /> Website
                                    </a>
                                  )}
                                  
                                  {instagramHandle && (
                                    <a 
                                      href={`https://instagram.com/${instagramHandle}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-trypie-600 hover:text-trypie-700"
                                    >
                                      <Instagram className="h-4 w-4" /> Instagram
                                    </a>
                                  )}
                                  
                                  {twitterHandle && (
                                    <a 
                                      href={`https://twitter.com/${twitterHandle}`}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-trypie-600 hover:text-trypie-700"
                                    >
                                      <Twitter className="h-4 w-4" /> Twitter
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-end gap-3 pt-2">
                        {isEditing ? (
                          <>
                            <Button variant="outline" onClick={() => {
                              setIsEditing(false);
                              setFullName(profile.fullName || "");
                              setAvatarUrl(profile.avatarUrl);
                              // Reset other fields to their original values
                              setBio(bio);
                              setWebsiteUrl(websiteUrl);
                              setInstagramHandle(instagramHandle);
                              setTwitterHandle(twitterHandle);
                              setInterests(interests);
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveProfile} 
                              disabled={isLoading}
                              variant="trypie"
                              className="button-animation"
                            >
                              {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => setIsEditing(true)}
                            variant="trypie"
                            className="button-animation"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit Profile
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <Card className="subtle-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>Travel Stats</CardTitle>
                        <CardDescription>
                          Your activity on Trypie
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg hover:bg-trypie-50 transition-colors">
                            <h3 className="text-sm font-medium text-gray-500">GROUPS JOINED</h3>
                            <p className="text-2xl font-bold text-trypie-600 mt-1">0</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg hover:bg-coral-50 transition-colors">
                            <h3 className="text-sm font-medium text-gray-500">TRIPS PLANNED</h3>
                            <p className="text-2xl font-bold text-coral-500 mt-1">0</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg hover:bg-trypie-50 transition-colors">
                            <h3 className="text-sm font-medium text-gray-500">REWARDS POINTS</h3>
                            <p className="text-2xl font-bold text-trypie-600 mt-1">100</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="account" className="mt-0">
                <Card className="subtle-shadow mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle>Change Email</CardTitle>
                    <CardDescription>
                      Update your email address. You will need to verify the new email.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4">
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" variant="trypie" disabled={isUpdatingEmail}>
                          {isUpdatingEmail ? "Updating..." : "Update Email"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card className="subtle-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to maintain account security
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" variant="trypie" disabled={isUpdatingPassword}>
                          {isUpdatingPassword ? "Updating..." : "Change Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-0">
                <MyReviewsSection userId={user?.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded mx-auto w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <p className="mt-6 text-gray-500">Loading profile information...</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
