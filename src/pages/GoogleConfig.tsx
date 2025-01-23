import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function GoogleConfig() {
  const [projectId, setProjectId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('google_credentials')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCredentials(data);
        setProjectId(data.project_id);
        setClientEmail(data.client_email);
        // Don't set private key for security
      }
    } catch (error: any) {
      toast({
        title: "Error fetching credentials",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !privateKey || !clientEmail) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from('google_credentials')
        .upsert({
          user_id: session.user.id,
          project_id: projectId,
          private_key: privateKey,
          client_email: clientEmail,
          status: 'pending'
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Google API credentials have been saved",
      });
      
      fetchCredentials();
      setPrivateKey(""); // Clear private key from form
    } catch (error: any) {
      toast({
        title: "Error saving credentials",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Google Indexing API Configuration</h1>
        {credentials && (
          <div className="flex items-center gap-2">
            {credentials.status === 'active' ? (
              <CheckCircle className="text-green-500" />
            ) : credentials.status === 'invalid' ? (
              <XCircle className="text-red-500" />
            ) : (
              <Loader2 className="animate-spin text-yellow-500" />
            )}
            <span className="text-sm capitalize">{credentials.status}</span>
          </div>
        )}
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project ID</Label>
            <Input
              id="projectId"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="your-project-123"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="your-service-account@your-project-123.iam.gserviceaccount.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key</Label>
            <Input
              id="privateKey"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Credentials"
            )}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Setup Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Go to the Google Cloud Console</li>
          <li>Create a new project or select an existing one</li>
          <li>Enable the Indexing API for your project</li>
          <li>Create a service account and download the JSON key</li>
          <li>Enter the Project ID, Client Email, and Private Key from the JSON file above</li>
        </ol>
      </Card>
    </div>
  );
}