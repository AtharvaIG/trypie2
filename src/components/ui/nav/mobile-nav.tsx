
import { Link } from "react-router-dom";
import { LogOut, User, Settings, Star, Award } from "lucide-react";
import { NavLink, getNavLinks } from "./navbar-links";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

type MobileNavProps = {
  isAuthenticated: boolean;
  isActive: (path: string) => boolean;
  closeMenu: () => void;
  handleLogout: () => void;
};

export const MobileNav = ({ isAuthenticated, isActive, closeMenu, handleLogout }: MobileNavProps) => {
  const { profile } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="mt-4 pt-4 border-t flex flex-col space-y-3">
        <Button variant="outline" size="sm" asChild className="button-animation">
          <Link to="/login" onClick={closeMenu}>
            Log In
          </Link>
        </Button>
        <Button size="sm" asChild className="button-animation">
          <Link to="/signup" onClick={closeMenu}>
            Sign Up
          </Link>
        </Button>
      </div>
    );
  }

  const navLinks = getNavLinks();

  return (
    <>
      <ul className="flex flex-col space-y-3">
        {navLinks.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              icon={link.icon}
              label={link.label}
              isActive={isActive(link.path)}
              onClick={closeMenu}
            />
          </li>
        ))}
      </ul>
      
      <div className="mt-4 pt-4 border-t flex flex-col space-y-3">
        <Button 
          variant="ghost"
          asChild
          className="justify-start"
        >
          <Link 
            to="/profile" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <User size={16} className="text-gray-700" />
            <span className="text-sm text-gray-700">Profile Information</span>
          </Link>
        </Button>
        
        <Button 
          variant="ghost"
          asChild
          className="justify-start"
        >
          <Link 
            to="/profile?tab=settings" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <Settings size={16} className="text-gray-700" />
            <span className="text-sm text-gray-700">Account Settings</span>
          </Link>
        </Button>
        
        <Button 
          variant="ghost"
          asChild
          className="justify-start"
        >
          <Link 
            to="/profile?tab=reviews" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <Star size={16} className="text-gray-700" />
            <span className="text-sm text-gray-700">My Reviews</span>
          </Link>
        </Button>
        
        <Button 
          variant="ghost"
          asChild
          className="justify-start"
        >
          <Link 
            to="/rewards" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <Award size={16} className="text-gray-700" />
            <span className="text-sm text-gray-700">My Rewards</span>
          </Link>
        </Button>
        
        <Separator className="my-2" />
        
        <Button variant="outline" size="sm" onClick={() => { handleLogout(); closeMenu(); }} className="button-animation">
          <LogOut size={18} className="mr-1" /> Log Out
        </Button>
      </div>
    </>
  );
};
