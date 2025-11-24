/*
MemberManagement Description:
This component fetches and merges profile and membership data from Supabase, 
displays a collapsible list of members, and opens a detailed modal for viewing 
or editing a selected member with full error handling.
*/



import { useEffect, useState } from "react";
import { admin_supabase} from "./supabaseClient";
import MemberDetailsModal from "./MemberDetailsModal";

const MemberManagement = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    fetchMembers(); 
  }, []);

  //Function to fetch data from Supabase
  const fetchMembers = async () => {
    try{
      //Get User Profiles first
        const { data: profilesData, error: profilesError } = await admin_supabase
        .from('profiles') //the table in Supabase we fetch from
        .select('*')
        .order('created_at', { ascending: false }); //get newest members first
      
      if (profilesError){
        console.error("Error occured while fetching profiles: ", profilesError);
        throw profilesError;
      }
      if (!profilesData){
        console.warn("DATA is NULL: ", {profilesData})
        return;
      }

      //Then retrive all memberships
      const {data: membershipsData, error: membershipsError} = await admin_supabase
      .from('memberships')
      .select('*')
      if (membershipsError){
        console.error("Error occured while fetching memberships: ", membershipsError);
        throw membershipsError;
      } 
      //manually map each profile to thier memberships. The reason i do this is cuz, there is no FK relatoinship supabase knows about in its schema cache even though memberships.user_id points to profiles.id. I got this error --> PGRST200, 'searched for FK relationship but no match was found. Could not find a relationship between profiles and memberships in schema cache
      //profiledata is an array.  Map iterates over the array and returns a new one where each one can be transformed.
      const mergeData = profilesData.map(profile => ({ 
        ...profile, //spread operator: copy all existing properties of profile into new object.
        memberships: membershipsData?.filter(m => m.user_id === profile.id) || [], //memberships is the new property too add to each profile. using filter to keep only ones that match m.user id and profile.id
      }));

      console.log(mergeData);
      setMembers(mergeData);
    }catch (error){
      console.error("Error fetching members: ", error);
      alert("Failed to load members. Please try again.")
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-yellow-500 self-start">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-white font-bold text-lg mb-4 flex justify-between items-center"
      >
        Member Management
        <span className="text-slate-300 text-l">{open ? '-' : '+'}</span> 
      </button>

      {open && (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {members.map((member, index) => (
            <button
              key={member.id} 
              onClick={()=>{
                setSelectedMember(member);
                setShowMemberModal(true);
              }}
              className="w-full text-left p-3 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                  {index+1}
                </div>
                <div>
                  <p className="font-semibold text-yellow-600">Name: {member.full_name}<br/></p>
                  <p className="text-sm text-slate-600">Tier: {member.memberships?.[0]?.tier || 'No subscription'}<br/></p>
                  <p className="text-sm text-slate-600">Account Created At: {member.created_at.slice(0, 10)}<br/></p>
                  <p className="text-sm text-slate-600">Membership Status: {member.memberships?.[0]?.status || "No membership"}<br/></p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showMemberModal && (
        <MemberDetailsModal
          cls={selectedMember}
          onClose={() => { setShowMemberModal(false); setSelectedMember(null);}}
          refreshMembers={fetchMembers}
        />
      )}
    </div>
  );
};

export default MemberManagement;