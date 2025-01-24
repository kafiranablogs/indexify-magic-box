import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', session.user.id);

      if (error) throw error;
      setTeams(teams || []);
    } catch (error: any) {
      toast({
        title: "Error fetching teams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: team, error } = await supabase
        .from('teams')
        .insert([
          { name: newTeamName.trim(), owner_id: session.user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      setTeams([...teams, team]);
      setNewTeamName("");
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teams</h1>
      </div>

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

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">{team.name}</h3>
              </div>
              <Button variant="outline">Manage Team</Button>
            </div>
          </Card>
        ))}
        {teams.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              You haven't created any teams yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}