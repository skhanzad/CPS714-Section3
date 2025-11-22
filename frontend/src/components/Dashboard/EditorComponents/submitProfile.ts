import { supabase } from "../../../lib/supabase";
import { Database } from "../../../lib/supabase";

/* Use the same type definition */
// Define a specific type for the profile object, including the nested subscription data.
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
  // membership_subscriptions is returned as an array when selecting relations
  membership_subscriptions: (Database['public']['Tables']['membership_subscriptions']['Row'] & {
    membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
  })[] | null;
};

interface SubmitProfileProps {
  userId: string;
  updates: Record<string, any>;
  currentProfile: ProfileWithSubscription;
}

export const submitProfile = async ({ userId, updates, currentProfile,}: SubmitProfileProps) => {
  // @ts-ignore
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select(
      `
      *,
      membership_subscriptions!left (
        *,
        membership_tiers (*)
      )
    `
    )
    .single();

  if (error) throw error;

  // @ts-ignore
  return { ...currentProfile, ...data };
};
