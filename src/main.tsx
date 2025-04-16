
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
import App from "./App";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Groups from "./pages/Groups";
import PlanTrip from "./pages/PlanTrip";
import Rewards from "./pages/Rewards";
import GroupInvitation from "./pages/GroupInvitation";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create the router first
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "/profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: "/explore",
        element: <Explore />, // Remove the ProtectedRoute wrapper to allow all users to access
      },
      {
        path: "/groups",
        element: <ProtectedRoute><Groups /></ProtectedRoute>,
      },
      {
        path: "/groups/invitation",
        element: <GroupInvitation />,
      },
      {
        path: "/plan-trip",
        element: <ProtectedRoute><PlanTrip /></ProtectedRoute>,
      },
      {
        path: "/rewards",
        element: <ProtectedRoute><Rewards /></ProtectedRoute>,
      },
      {
        path: "*",
        element: <NotFound />,
      }
    ],
  },
]);

// Render with correct provider hierarchy
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="trypie-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
