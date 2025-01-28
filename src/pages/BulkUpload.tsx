import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function BulkUpload() {
  const [urls, setUrls] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one URL",
        variant: "destructive",
      });
      return;
    }

    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);

    try {
      setIsLoading(true);
      // API integration will go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Success",
        description: `${urlList.length} URLs have been submitted for indexing`,
      });
      setUrls("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit URLs for indexing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bulk URL Upload</h1>
        <p className="text-muted-foreground">
          Submit multiple URLs for indexing at once. Each URL should be on a new line.
        </p>
      </div>

      <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-lg mb-2">Accepted URL Format Guidelines</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Each URL must be on a new line
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                URLs must include the full protocol (https:// or http://)
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                URLs must be publicly accessible
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Example: https://example.com/page-1
              </li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="urls" className="text-sm font-medium">
                URLs to Index
              </label>
              <Textarea
                id="urls"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#1A1F2C] text-white hover:bg-[#2A2F3C]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit URLs for Indexing"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}