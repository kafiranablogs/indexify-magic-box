import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateTeamFormProps {
  onTeamCreated: () => void;
}

export function CreateTeamForm({ onTeamCreated }: CreateTeamFormProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('teams')
        .insert([
          { name: newTeamName.trim(), owner_id: session.user.id }
        ]);

      if (error) throw error;

      setNewTeamName("");
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
      onTeamCreated();
    } catch (error: any) {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={createTeam} className="space-y-4">
        <h2 className="text-xl font-bold">Create New Team</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isCreating || !newTeamName.trim()}
            className="self-end"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}