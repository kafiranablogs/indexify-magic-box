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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bulk URL Upload</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="urls" className="text-sm font-medium">
              URLs to Index (one per line)
            </label>
            <Textarea
              id="urls"
              placeholder="https://example.com/page-1&#10;https://example.com/page-2&#10;https://example.com/page-3"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="min-h-[200px]"
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