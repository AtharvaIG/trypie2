
import { Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface RewardCardProps {
  title: string;
  description: string;
  pointsCost: number;
  image: string;
  category: string;
  isLocked?: boolean;
}

const RewardCard = ({
  title,
  description,
  pointsCost,
  image,
  category,
  isLocked = false,
}: RewardCardProps) => {
  return (
    <Card className={`overflow-hidden card-hover ${isLocked ? 'opacity-75' : ''}`}>
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
        />
        <div className="absolute top-3 left-3 bg-white/90 text-trypie-600 text-xs font-medium px-2 py-1 rounded">
          {category}
        </div>
        <div className="absolute top-3 right-3 bg-trypie-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center">
          <Star size={12} className="text-yellow-300 mr-1" />
          <span>{pointsCost} points</span>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardFooter>
        {isLocked ? (
          <Button className="w-full" disabled>
            <Award className="mr-2 h-4 w-4" />
            Earn More Points
          </Button>
        ) : (
          <Button className="w-full">
            <Award className="mr-2 h-4 w-4" />
            Redeem Reward
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default RewardCard;
