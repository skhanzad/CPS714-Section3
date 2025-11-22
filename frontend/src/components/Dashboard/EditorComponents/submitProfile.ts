/**
 * Submit Profile Component:
 * Handles the submission of updated profile information to the database.
 * 
 * The component receives the following props:
 * - userId: The unique identifier of the user whose profile is being updated.
 * - updates: An object containing the fields to be updated in the user's profile.
 * - currentProfile: The current profile data of the user, used to merge with updated data.
 * 
 * It accesses the Supabase client to perform the update operation on the 'profiles' table.
 * The appropriate update is made based on the provided userId and updates object.
 * The function then returns the updated profile data upon successful submission or throws an error if the update fails.
 * 
 * @param {string} userId - The unique identifier of the user whose profile is being updated.
 * @param {Record<string, any>} updates - An object containing the fields to be updated in the user's profile.
 * @param {ProfileWithSubscription} currentProfile - The current profile data of the user, used to merge with updated data.
 * 
 * @returns {ProfileWithSubscription} - Returns an updated profile object upon successful submission.
 * @throws {error} - Throws an error if the update operation fails.
 * 
 */

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
