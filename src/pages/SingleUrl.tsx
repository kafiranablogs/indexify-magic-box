import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function SingleUrl() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGoogleCredentials, setHasGoogleCredentials] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and Google credentials status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit URLs",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has valid Google credentials
      const { data: credentials, error } = await supabase
        .from('google_credentials')
        .select('status')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking Google credentials:', error);
      } else {
        setHasGoogleCredentials(credentials?.status === 'active');
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url); // This will throw an error if URL is invalid
    } catch (error) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Check for Google credentials before submission
      if (!hasGoogleCredentials) {
        toast({
          title: "Google credentials required",
          description: "Please configure your Google Indexing API credentials first",
          variant: "destructive",
        });
        navigate("/google-config");
        return;
      }

      // Try to insert the URL
      const { error: insertError } = await supabase
        .from('url_submissions')
        .insert({
          url,
          user_id: session.user.id,
          status: 'pending'
        });

      if (insertError) {
        // Handle duplicate URL error
        if (insertError.code === '23505') {
          toast({
            title: "Duplicate URL",
            description: "This URL has already been submitted for indexing",
            variant: "destructive",
          });
          return;
        }
        throw insertError;
      }

      // Trigger the indexing process via Edge Function
      const { error: indexingError } = await supabase.functions.invoke('google-indexing', {
        body: { url }
      });

      if (indexingError) throw indexingError;

      toast({
        title: "Success",
        description: "URL has been submitted for indexing",
      });
      setUrl("");
    } catch (error: any) {
      console.error('Error submitting URL:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit URL for indexing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Single URL</h1>
      
      {!hasGoogleCredentials && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-yellow-800">Google Credentials Required</h2>
            <p className="text-yellow-700">
              To submit URLs for indexing, you need to configure your Google Indexing API credentials first.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/google-config")}
              className="mt-2"
            >
              Configure Google Credentials
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL to Index
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/page-to-index"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              disabled={!hasGoogleCredentials}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !hasGoogleCredentials}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit URL for Indexing"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}