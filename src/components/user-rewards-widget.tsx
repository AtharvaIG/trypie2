
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useRewards } from "@/hooks/use-rewards";

export function UserRewardsWidget() {
  const { isLoading, userSettings, levelProgress } = useRewards();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          <Skeleton className="h-7 w-40" />
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-4 w-40 mt-1" />
        </div>
        
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Reward Progress</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Level Progress</p>
          <p className="text-sm text-gray-600">
            {userSettings?.current_points || 0}/{userSettings?.current_points + levelProgress.pointsToNextLevel} points
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-trypie-600 h-2.5 rounded-full" 
            style={{ width: `${levelProgress.progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {levelProgress.pointsToNextLevel} points until {levelProgress.nextLevel || "max"} level
        </p>
      </div>
      
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Ways to earn points:</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex items-center">
          <Star className="text-coral-500 mr-2 h-4 w-4" />
          Write a review (+20 points)
        </li>
        <li className="flex items-center">
          <MapPin className="text-coral-500 mr-2 h-4 w-4" />
          Complete a trip (+50 points)
        </li>
        <li className="flex items-center">
          <Users className="text-coral-500 mr-2 h-4 w-4" />
          Create a travel group (+30 points)
        </li>
      </ul>
      
      <Button className="w-full mt-4" asChild>
        <Link to="/rewards">View All Rewards</Link>
      </Button>
    </div>
  );
};

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
