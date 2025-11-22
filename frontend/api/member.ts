export type Member = {
  member_id: string,  // Unique identifier for the member
  first_name: string, // Member's first name
  last_name: string, // Member's last name
  member_status: string // Membership status (e.g., basic, premium, VIP)
};

export async function getMemberById(memberId: string): Promise<Member> {

  // Fetch member data from backend API
  const res = await fetch(`http://localhost:8000/members/${memberId}`);

  // Throw error if HTTP response fails
  if (!res.ok) {
    throw new Error(`Failed to fetch member ${memberId}`);
  }

  // Parse JSON response from backend
  const data = await res.json();

  // If backend response indicates failure, throw error
  if (!data.success) {
    throw new Error(data.message);
  }

  // Extract member data from response
  const memberData = data.member;
  
  // Return a properly typed Member object for frontend use
  return {
    member_id: memberData.member_id,
    first_name: memberData.first_name,
    last_name: memberData.last_name,
    member_status: memberData.member_status,
  };
}
