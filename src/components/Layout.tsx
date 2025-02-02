import { useState, useEffect } from "react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const { state } = useSidebar();

  // Check if user is authenticated
  const [session, setSession] = useState<any>(null);

  // Get current page title based on route
  const getCurrentPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/single-url":
        return "Single URL";
      case "/bulk-upload":
        return "Bulk Upload";
      case "/google-config":
        return "Google Config";
      case "/teams":
        return "Teams";
      case "/profile":
        return "Profile";
      default:
        return "";
    }
  };

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear any local storage that might be causing issues
      localStorage.removeItem('supabase.auth.token');
      navigate('/'); // Changed from '/auth' to '/'
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
      });
    }
  };

  // If not authenticated, just render the content without sidebar
  if (!session) {
    return <main className="flex-1 p-6">{children}</main>;
  }

  // If authenticated, render with sidebar and logout button
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            {state === "collapsed" && (
              <h1 className="text-xl font-semibold">{getCurrentPageTitle()}</h1>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}