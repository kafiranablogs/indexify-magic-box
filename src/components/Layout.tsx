import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <SidebarTrigger />
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
    </SidebarProvider>
  );
}