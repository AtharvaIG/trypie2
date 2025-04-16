
import { Link } from "react-router-dom";
import { Profile } from "@/types/auth-types";
import { User } from "lucide-react";

type ProfileMenuProps = {
  profile?: Profile | null;
};

export const ProfileMenu = ({ profile }: ProfileMenuProps) => {
  return (
    <Link 
      to="/profile" 
      className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
    >
      <User size={16} className="text-gray-700" />
      <span className="text-sm text-gray-700">Profile</span>
    </Link>
  );
};
