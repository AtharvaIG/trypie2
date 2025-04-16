
import { Link } from "react-router-dom";
import { LayoutDashboard, Map, Users, MapPin } from "lucide-react";

type NavLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

export const NavLink = ({ to, icon, label, isActive, onClick }: NavLinkProps) => (
  <Link
    to={to}
    className={`text-gray-600 hover:text-trypie-600 transition-colors flex items-center gap-1 py-1 px-2 rounded-md ${
      isActive ? "bg-trypie-50 text-trypie-600 font-medium" : ""
    }`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export type NavLinkItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

export const getNavLinks = (): NavLinkItem[] => [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
  },
  {
    path: "/plan-trip",
    label: "Plan Trip",
    icon: <MapPin size={16} />,
  },
  {
    path: "/explore",
    label: "Explore",
    icon: <Map size={16} />,
  },
  {
    path: "/groups",
    label: "Groups",
    icon: <Users size={16} />,
  },
];
