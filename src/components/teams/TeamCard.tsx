import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { TeamMembers } from "@/components/TeamMembers";
import { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{team.name}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
        
        {isExpanded && (
          <TeamMembers teamId={team.id} />
        )}
      </div>
    </Card>
  );
}