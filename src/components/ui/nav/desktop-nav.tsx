
import { Link } from "react-router-dom";
import { LogOut, User, Settings, Star, Award } from "lucide-react";
import { NavLink, getNavLinks } from "./navbar-links";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DesktopNavProps = {
  isAuthenticated: boolean;
  isActive: (path: string) => boolean;
  handleLogout: () => void;
};

export const DesktopNav = ({ isAuthenticated, isActive, handleLogout }: DesktopNavProps) => {
  const { profile } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" asChild className="button-animation">
          <Link to="/login">Log In</Link>
        </Button>
        <Button size="sm" asChild className="button-animation">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    );
  }

  const navLinks = getNavLinks();

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="hidden md:flex items-center space-x-6">
      <ul className="flex items-center space-x-6">
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              icon={link.icon}
              label={link.label}
              isActive={isActive(link.path)}
            />
          </li>
        ))}
      </ul>
      
      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatarUrl || ''} alt={profile?.fullName || 'User'} />
                  <AvatarFallback className="bg-trypie-100 text-trypie-800">
                    {getInitials(profile?.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline">{profile?.fullName || 'User'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                <User size={16} />
                <span>Profile Information</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/profile?tab=settings" className="cursor-pointer flex items-center gap-2">
                <Settings size={16} />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/profile?tab=reviews" className="cursor-pointer flex items-center gap-2">
                <Star size={16} />
                <span>My Reviews</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link to="/rewards" className="cursor-pointer flex items-center gap-2">
                <Award size={16} />
                <span>My Rewards</span>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 flex items-center gap-2">
              <LogOut size={16} />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
