
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Users, MapPin } from "lucide-react";
import { acceptGroupInvitation } from "@/services/travel-group-service";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

const GroupInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "error" | "success" | "unauthenticated">("loading");
  const [message, setMessage] = useState("Verifying invitation...");
  const [groupDetails, setGroupDetails] = useState<{
    id: string;
    title: string;
    destination: string;
    image_url?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation link. No token provided.");
      return;
    }

    if (!isAuthenticated) {
      setStatus("unauthenticated");
      setMessage("Please sign in to join this travel group.");
      return;
    }

    const processInvitation = async () => {
      try {
        const result = await acceptGroupInvitation(token);
        
        if (result.success) {
          setStatus("success");
          setMessage("You've successfully joined the group!");
          setGroupDetails({
            id: result.group.id,
            title: result.group.title,
            destination: result.group.destination,
            image_url: result.group.image_url
          });
          
          toast({
            title: "Welcome!",
            description: `You've joined ${result.group.title}`,
          });
        }
      } catch (error: any) {
        console.error("Error accepting invitation:", error);
        setStatus("error");
        setMessage(error.message || "Failed to accept invitation.");
        
        toast({
          title: "Error",
          description: error.message || "Failed to accept invitation",
          variant: "destructive"
        });
      }
    };

    if (isAuthenticated) {
      processInvitation();
    }
  }, [token, isAuthenticated, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Travel Group Invitation</CardTitle>
            <CardDescription>Join this travel group on Trypie</CardDescription>
          </CardHeader>
          
          <CardContent>
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-trypie-600 animate-spin mb-4" />
                <p className="text-center text-gray-500">{message}</p>
              </div>
            )}
            
            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-center text-red-500 font-medium">{message}</p>
              </div>
            )}
            
            {status === "unauthenticated" && (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <p className="text-center text-gray-700 mb-4">{message}</p>
                <Button 
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                >
                  Sign in to continue
                </Button>
              </div>
            )}
            
            {status === "success" && groupDetails && (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-center text-green-600 font-medium">{message}</p>
                
                <div className="w-full bg-gray-50 border rounded-lg p-4 mt-4">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{groupDetails.title}</h3>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-trypie-500" />
                      <span>{groupDetails.destination}</span>
                    </div>
                    
                    {groupDetails.image_url && (
                      <div className="aspect-video w-full overflow-hidden rounded-md">
                        <img 
                          src={groupDetails.image_url} 
                          alt={groupDetails.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pt-4">
            {status === "success" && (
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate(`/groups`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Go to My Groups
              </Button>
            )}
            
            {status === "error" && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/groups")}
              >
                Browse Other Groups
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default GroupInvitation;
