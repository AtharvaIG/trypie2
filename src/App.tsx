
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <TooltipProvider>
      <AuthProvider>
        <Outlet />
        <Toaster />
        <SonnerToaster 
          position="bottom-right"
          theme="light"
          closeButton
        />
      </AuthProvider>
    </TooltipProvider>
  );
};

export default App;
