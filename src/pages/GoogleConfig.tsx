import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6 max-w-4xl mx-auto">
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
        <h2 className="text-xl font-bold mb-4">Step-by-Step Setup Guide</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Create a Google Cloud Project</h3>
            <p className="text-gray-600">
              Visit the Google Cloud Console and create a new project or select an existing one.
            </p>
            <a 
              href="https://console.cloud.google.com/projectcreate" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
            >
              Go to Google Cloud Console <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">2. Enable the Indexing API</h3>
            <p className="text-gray-600">
              Enable the Indexing API for your project in the Google Cloud Console.
            </p>
            <a 
              href="https://console.cloud.google.com/apis/library/indexing.googleapis.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
            >
              Enable Indexing API <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">3. Create Service Account</h3>
            <p className="text-gray-600">
              Create a service account and download the JSON credentials file:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4 text-gray-600">
              <li>Go to "IAM & Admin" > "Service Accounts"</li>
              <li>Click "Create Service Account"</li>
              <li>Fill in the service account details</li>
              <li>Grant "Owner" role to the service account</li>
              <li>Click "Create Key" (JSON format)</li>
              <li>Save the downloaded JSON file</li>
            </ol>
            <a 
              href="https://console.cloud.google.com/iam-admin/serviceaccounts" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
            >
              Manage Service Accounts <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Enter Your Credentials</h2>
        <p className="text-gray-600 mb-4">
          Enter the details from your downloaded service account JSON file:
        </p>
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
        <h2 className="text-xl font-bold mb-4">Additional Resources</h2>
        <div className="space-y-2">
          <a 
            href="https://developers.google.com/search/apis/indexing-api/v3/quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
          >
            Google Indexing API Documentation <ExternalLink className="h-4 w-4" />
          </a>
          <a 
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
          >
            Google Cloud Console Credentials <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </Card>
    </div>
  );
}