
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopNav } from "./nav/desktop-nav";
import { MobileNav } from "./nav/mobile-nav";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-trypie-600 to-trypie-500 bg-clip-text text-transparent">
              Trypie
            </span>
          </Link>

          {/* Desktop Menu */}
          <DesktopNav 
            isAuthenticated={isAuthenticated} 
            isActive={isActive} 
            handleLogout={handleLogout} 
          />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-3 border-t fade-in">
            <MobileNav 
              isAuthenticated={isAuthenticated}
              isActive={isActive}
              closeMenu={() => setIsMenuOpen(false)}
              handleLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
