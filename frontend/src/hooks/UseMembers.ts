import { useCallback, useEffect, useState } from "react";
import { getMemberById, type Member } from "../../api/member";

//
// Predefined member IDs for different subscription levels
//
const BASIC_ID = "10762c5f-114a-442c-aadc-53aae291f407";
const PREMIUM_ID = "78c0d668-f986-439a-8132-0c816d466e7d";
const VIP_ID = "a914c4d2-7c2f-407e-a405-c60e2283b1b2";

//
// useMembers Hook
// ----------------
// Custom React hook to fetch and manage a set of members (basic, premium, VIP)
//
// Returns:
// - members: array of Member objects
// - loading: boolean indicating fetch status
// - error: string if fetch fails
// - fetchMembers: function to manually refetch
//
export function useMembers() {
  // Holds the list of members
  const [members, setMembers] = useState<Member[]>([]);

  // Loading state while fetching
  const [loading, setLoading] = useState(true);

  // Error message if fetching fails
  const [error, setError] = useState<string | null>(null);


  //
  // fetchMembers
  // --------------
  // Async function to fetch the three predefined members in parallel
  //
  const fetchMembers = useCallback(async () => {
    setLoading(true); // start loading
    setError(null); // reset previous error
    try {
      // Fetch all three members simultaneously
      const [basic, premium, vip] = await Promise.all([
        getMemberById(BASIC_ID),
        getMemberById(PREMIUM_ID),
        getMemberById(VIP_ID),
      ]);
      // Update state with fetched members
      setMembers([basic, premium, vip]);
    } catch (err: any) {
       // Log error and update state
      console.error(err);
      setError(err.message ?? "Failed to fetch members");
    } finally {
      // Always set loading to false once done
      setLoading(false);
    }
  }, []);

  //
  // Fetch members automatically when the hook is first used
  //
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Return members, loading state, error, and manual fetch function
  return { members, loading, error, fetchMembers };
}
