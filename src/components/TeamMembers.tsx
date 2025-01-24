import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type TeamMember = Tables<"team_members"> & {
  profiles: Tables<"profiles"> | null;
};

export function TeamMembers({ teamId }: { teamId: string }) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      const { data: members, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles (*)
        `)
        .eq("team_id", teamId);

      if (error) throw error;
      setMembers(members || []);
    } catch (error: any) {
      toast({
        title: "Error fetching team members",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsLoading(true);
    try {
      // First, find the user by email
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", newMemberEmail.trim())
        .maybeSingle();

      if (userError) throw userError;
      if (!userProfile) {
        throw new Error("User not found");
      }

      // Check if user is already a member
      const { data: existingMember, error: memberError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId)
        .eq("user_id", userProfile.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (existingMember) {
        throw new Error("User is already a member of this team");
      }

      // Add the user to the team
      const { error: insertError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: teamId,
            user_id: userProfile.id,
            role: "team_member",
          },
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Member added",
        description: "Team member has been added successfully.",
      });

      setNewMemberEmail("");
      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Team member has been removed successfully.",
      });

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={addMember} className="space-y-4">
          <h3 className="text-lg font-semibold">Add Team Member</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="memberEmail">Member Email</Label>
              <Input
                id="memberEmail"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter member email"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !newMemberEmail.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {members.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{member.profiles?.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.role}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeMember(member.id)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}