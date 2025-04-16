
import { useState, useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Gift, Heart, MapPin, Star, Users } from "lucide-react";
import RewardCard from "@/components/reward-card";
import { useRewards } from "@/hooks/use-rewards";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

const Rewards = () => {
  const { profile } = useAuth();
  const { 
    isLoading, 
    userSettings, 
    rewardTypes, 
    earnedBadges, 
    rewardHistory, 
    levelProgress 
  } = useRewards();

  // Convert reward types to reward cards
  const rewardCards = rewardTypes
    .filter(reward => !reward.is_secret)
    .map(reward => ({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.points,
      image: getRewardImage(reward.title),
      category: getRewardCategory(reward.title),
      isLocked: false, // In a real app, would determine if user can redeem this
    }));

  // Helper function to get a relevant image for reward
  function getRewardImage(title: string): string {
    const imageMap: Record<string, string> = {
      "Write a Review": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80",
      "Complete a Trip": "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&q=80",
      "Create or Join a Group": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&q=80",
      "Upload Trip Photo": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80",
      "Share a Trip": "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80",
      "Refer a Friend": "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&q=80",
    };
    
    return imageMap[title] || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80";
  }

  // Helper function to categorize rewards
  function getRewardCategory(title: string): string {
    if (title.includes("Review")) return "Engagement";
    if (title.includes("Trip")) return "Travel";
    if (title.includes("Group")) return "Social";
    if (title.includes("Photo")) return "Media";
    if (title.includes("Share")) return "Social";
    if (title.includes("Friend")) return "Referral";
    return "Experience";
  }

  // Format date for display
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-trypie-600 to-trypie-800 py-12 px-4 md:px-6 text-white">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Rewards Program</h1>
                <p className="text-white/90 max-w-xl">
                  Earn points for sharing your travel experiences and redeem them for exclusive rewards.
                </p>
              </div>
              
              {isLoading ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[220px]">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2 w-full mb-1" />
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[220px]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Your Points</span>
                    <span className="text-lg font-bold">{userSettings?.current_points || 0}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">{levelProgress.currentLevel}</span>
                    <span className="text-sm">{levelProgress.nextLevel || "Max Level"}</span>
                  </div>
                  <Progress value={levelProgress.progressPercentage} className="h-2 bg-white/20" />
                  {levelProgress.nextLevel && (
                    <p className="text-xs mt-1 text-right">
                      {levelProgress.pointsToNextLevel} points until next level
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Tabs defaultValue="rewards">
            <TabsList className="mb-6">
              <TabsTrigger value="rewards" className="flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="history">Points History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rewards" className="mt-0">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">How to Earn Points</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-100 rounded-lg p-4">
                    <Star className="h-10 w-10 text-yellow-500 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Write Reviews</h3>
                    <p className="text-gray-600 text-sm">
                      Share your honest experiences to help other travelers.
                    </p>
                    <p className="text-trypie-600 font-medium mt-2">+20 points</p>
                  </div>
                  
                  <div className="border border-gray-100 rounded-lg p-4">
                    <MapPin className="h-10 w-10 text-coral-500 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Complete Trips</h3>
                    <p className="text-gray-600 text-sm">
                      Track and complete your trips through the platform.
                    </p>
                    <p className="text-trypie-600 font-medium mt-2">+50 points</p>
                  </div>
                  
                  <div className="border border-gray-100 rounded-lg p-4">
                    <Users className="h-10 w-10 text-trypie-500 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">Create & Join Groups</h3>
                    <p className="text-gray-600 text-sm">
                      Connect with fellow travelers through group trips.
                    </p>
                    <p className="text-trypie-600 font-medium mt-2">+30 points</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rewards</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewardCards.map((reward, index) => (
                    <RewardCard 
                      key={index} 
                      {...reward} 
                      isLocked={reward.pointsCost > (userSettings?.current_points || 0)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="badges" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Badges</h2>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="border rounded-lg p-6">
                        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-3" />
                        <Skeleton className="h-5 w-2/3 mx-auto mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : earnedBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {earnedBadges.map((badge, index) => (
                      <div 
                        key={index} 
                        className="border border-trypie-200 bg-trypie-50 rounded-lg p-6 text-center"
                      >
                        <div className="flex justify-center mb-3">
                          {badge.icon && (
                            <Icon name={badge.icon as any} className="h-12 w-12 text-trypie-600" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{badge.description}</p>
                        <p className="text-sm font-medium text-trypie-600">
                          Earned • {badge.points} pts
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(badge.earned_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Badges Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Continue using Trypie to unlock badges. Write reviews, plan trips, and engage with the community to earn your first badge.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Badge Levels</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {levelProgress.currentLevel === 'Wanderer' ? 'Wanderer (Current)' : 'Wanderer'}
                      </h3>
                      <p className="text-gray-600 text-sm">0-199 points • Basic rewards access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-trypie-100 flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-trypie-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {levelProgress.currentLevel === 'Explorer' ? 'Explorer (Current)' : 'Explorer'}
                      </h3>
                      <p className="text-gray-600 text-sm">200-499 points • Enhanced rewards access</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-coral-100 flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-coral-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {levelProgress.currentLevel === 'Adventurer' ? 'Adventurer (Current)' : 'Adventurer'}
                      </h3>
                      <p className="text-gray-600 text-sm">500-999 points • Enhanced rewards & discounts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-sand-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {levelProgress.currentLevel === 'Pathfinder' ? 'Pathfinder (Current)' : 'Pathfinder'}
                      </h3>
                      <p className="text-gray-600 text-sm">1,000-1,999 points • Premium benefits & experiences</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {levelProgress.currentLevel === 'Globetrotter' ? 'Globetrotter (Current)' : 'Globetrotter'}
                      </h3>
                      <p className="text-gray-600 text-sm">2,000+ points • VIP status & exclusive rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Points History</h2>
                </div>
                
                <div className="border-t">
                  {isLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-64" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : rewardHistory.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rewardHistory.map((entry, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(entry.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                              <span className={entry.points > 0 ? "text-trypie-600" : "text-red-500"}>
                                {entry.points > 0 ? `+${entry.points}` : entry.points}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Gift className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Points History Yet</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Start earning points by writing reviews, planning trips, and engaging with the Trypie community.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Rewards;
