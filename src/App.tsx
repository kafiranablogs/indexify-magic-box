import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Routes } from "@/routes";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./App.css";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Routes />
        <Toaster />
      </SidebarProvider>
    </Router>
  );
}

export default App;