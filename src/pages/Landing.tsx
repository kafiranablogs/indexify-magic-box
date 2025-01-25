import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket, Globe, ChartBar, Users } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Indexify
          </h1>
          <Button 
            onClick={() => navigate("/auth")}
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            Login / Sign Up
          </Button>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Supercharge Your 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {" "}Web Presence
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Instantly index your URLs with Google. Fast, efficient, and powerful indexing solution for modern web applications.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="hover:scale-105 transition-transform"
            >
              Get Started
              <Rocket className="ml-2" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
            <Globe className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-primary" />
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="container mx-auto px-4 py-24"
      >
        <h3 className="text-3xl font-bold text-center mb-16">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Globe,
              title: "Single URL Indexing",
              description: "Index individual URLs with just one click"
            },
            {
              icon: ChartBar,
              title: "Bulk Upload",
              description: "Index multiple URLs simultaneously"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Work together with your team efficiently"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.8 }}
              className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}