import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { getRoutes } from "@/routes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import "./App.css";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  const routes = getRoutes(session);

  return (
    <Router>
      <SidebarProvider>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;