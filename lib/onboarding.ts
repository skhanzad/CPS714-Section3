import type { SupabaseClient, User, UserMetadata } from "@supabase/supabase-js";

export type OnboardingFormData = {
  fullName?: string;
  address?: string;
  contactNumber?: string;
  emergencyContact?: string;
  goals?: string[];
  tier?: string;
};

type EnsureArgs = {
  supabase: SupabaseClient;
  user: User;
  formData?: OnboardingFormData;
};

function normalizeMetadata(
  userMetadata: UserMetadata,
  formData?: OnboardingFormData
) {
  const metaGoals = Array.isArray(userMetadata?.goals)
    ? (userMetadata.goals as string[])
    : undefined;

  return {
    full_name: formData?.fullName ?? (userMetadata?.full_name as string | undefined) ?? "",
    address: formData?.address ?? (userMetadata?.address as string | undefined) ?? "",
    contact_number:
      formData?.contactNumber ??
      (userMetadata?.contact_number as string | undefined) ??
      "",
    emergency_contact:
      formData?.emergencyContact ??
      (userMetadata?.emergency_contact as string | undefined) ??
      "",
    goals: formData?.goals ?? metaGoals ?? [],
    membership_tier:
      formData?.tier ??
      (userMetadata?.membership_tier as string | undefined) ??
      "",
  };
}

export async function ensureProfileAndMembership({
  supabase,
  user,
  formData,
}: EnsureArgs) {
  const { full_name, address, contact_number, emergency_contact, goals, membership_tier } =
    normalizeMetadata(user.user_metadata, formData);

  // Guard against missing tier (we'll still create profile without membership)
  const tier = membership_tier?.toLowerCase();

  // Ensure profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileCheckError && profileCheckError.code !== "PGRST116") {
    throw profileCheckError;
  }

  if (!existingProfile) {
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: full_name || user.email,
      address,
      contact_number,
      emergency_contact,
      goals: goals ?? [],
    });

    if (profileInsertError) {
      throw profileInsertError;
    }
  }

  if (tier) {
    const { data: existingMembership, error: membershipCheckError } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipCheckError && membershipCheckError.code !== "PGRST116") {
      throw membershipCheckError;
    }

    if (!existingMembership) {
      const { error: membershipInsertError } = await supabase.from("memberships").insert({
        user_id: user.id,
        tier,
        status: "active",
      });

      if (membershipInsertError) {
        throw membershipInsertError;
      }
    }
  }
}



