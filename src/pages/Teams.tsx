import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { CreateTeamForm } from "@/components/teams/CreateTeamForm";
import { TeamCard } from "@/components/teams/TeamCard";

type Team = Tables<"teams">;

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchTeams();
  }, []);

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

      <CreateTeamForm onTeamCreated={fetchTeams} />

      <div className="grid gap-4">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
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