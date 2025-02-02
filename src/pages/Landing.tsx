import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Rocket, 
  Globe, 
  ChartBar, 
  Users, 
  Search, 
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

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
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            Indexify
          </motion.h1>
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
            <h2 className="text-6xl font-bold mb-6 leading-tight">
              Supercharge Your 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {" "}Web Presence
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Instantly index your URLs with Google. Our powerful platform helps you ensure your content gets discovered faster, improving your online visibility and SEO performance.
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="hover:scale-105 transition-transform group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:scale-105 transition-transform"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse" />
            <Globe 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 animate-[bounce_2s_infinite] transition-colors duration-300" 
              style={{
                color: 'var(--globe-color, #1A1F2C)',
                animation: 'bounce 2s infinite, colorChange 2s infinite'
              }}
            />
            <style>
              {`
                @keyframes bounce {
                  0%, 100% { transform: translate(-50%, -50%); }
                  50% { transform: translate(-50%, -65%); }
                }
                @keyframes colorChange {
                  0%, 100% { --globe-color: #1A1F2C; }
                  50% { --globe-color: #F4B400; }
                }
              `}
            </style>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-24"
      >
        <motion.h3 
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-16"
        >
          Why Choose Indexify?
        </motion.h3>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Search,
              title: "Instant Indexing",
              description: "Get your pages indexed by Google within minutes, not days or weeks"
            },
            {
              icon: Zap,
              title: "Bulk Processing",
              description: "Index multiple URLs simultaneously with our powerful bulk upload feature"
            },
            {
              icon: Shield,
              title: "Secure & Reliable",
              description: "Enterprise-grade security with 99.9% uptime guarantee"
            },
            {
              icon: Clock,
              title: "Real-time Updates",
              description: "Monitor indexing status in real-time with detailed analytics"
            },
            {
              icon: Users,
              title: "Team Collaboration",
              description: "Work efficiently with your team using shared workspaces"
            },
            {
              icon: CheckCircle2,
              title: "API Access",
              description: "Integrate indexing capabilities directly into your workflow"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="p-8 rounded-lg bg-card border hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-24 bg-accent/50 rounded-3xl mb-24"
      >
        <motion.h3 
          variants={itemVariants}
          className="text-4xl font-bold text-center mb-16"
        >
          How It Works
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: "1",
              title: "Connect",
              description: "Link your Google Search Console account with our secure platform"
            },
            {
              step: "2",
              title: "Submit",
              description: "Add your URLs individually or upload them in bulk"
            },
            {
              step: "3",
              title: "Monitor",
              description: "Track indexing status and performance in real-time"
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                {step.step}
              </div>
              <h4 className="text-2xl font-semibold mb-4">{step.title}</h4>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-24 text-center"
      >
        <motion.div
          variants={itemVariants}
          className="max-w-2xl mx-auto"
        >
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of websites already using Indexify to improve their search visibility
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="hover:scale-105 transition-transform"
          >
            Start Indexing Now
            <Rocket className="ml-2" />
          </Button>
        </motion.div>
      </motion.section>
    </div>
  );
}