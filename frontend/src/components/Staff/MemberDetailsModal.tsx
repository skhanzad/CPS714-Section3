/*
MemberDetailsModal Description:
This component displays a modal for viewing and editing member details, 
allowing admins to update specific fields with input validation and error handling, 
then saving changes to Supabase and showing a success alert before refreshing the member list
*/


import { PencilIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { admin_supabase } from './supabaseClient';

const MemberDetailsModal = ({cls, onClose, refreshMembers}: {cls: any, onClose: () => void, refreshMembers: () => void}) => {

    const [editingField, setEditingField] = useState<null | string>(null);
    const [editValue, setEditValue] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [memberData, setMemberData] = useState<{ [key: string]: any }>({ ...cls,
        tier: cls.memberships?.[0]?.tier 
     });



    const openEditor = (field: string) => {
        if (!(field in memberData)){
            console.error("Invalid field", {field}); //check if editing field is not a valid field then output error
            return;
        }
        setEditingField(field); //the column value for the member we are updating in the db
        setEditValue(memberData[field]);
    }


    //Update the supabase backend when an admin makes changes to certain fields
    const saveEdit = async() => {
        if (!editingField) return;

         
        if (editValue.trim() == ""){  
            alert("Please enter a non-empty value.");
            return; 
        }
        
        //skip save if the value wasn't changed
        if (editValue == memberData[editingField]){  
            setEditingField(null);
            setEditValue("");
            return; 
        }

        try{
            const {error} = await admin_supabase
            .from("memberships")
            .update({[editingField]: editValue})
            .eq("user_id", cls.id) //'id' is the membership id while 'user_id' is the users id which we need

            if (error) throw error;

            setShowAlert(true); //notee: checkmark popup to show updates have been made
            
            setTimeout(() => {setShowAlert(false); setEditingField(null);},500); //settimeout 2nd argument is in ms
            setMemberData(prev => ({...prev, [editingField]: editValue}))
            refreshMembers()
            setEditValue("");

        } catch (err: any){
            console.error(err);
            alert("failed to update please try again");
        }
  }

    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-yellow-500"> 
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold tracking-wide text-yellow-600 text-center">{cls.full_name}</h3>
                    <button onClick={onClose} className="text-white text-xl">x</button>
                </div>
                <div className="space-y-1 text-sm text-slate-200 leading-6">
                    <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
                        <span className="font-semibold text-white">Membership Tier: {memberData.tier || "None"}</span>
                        <PencilIcon className="cursor-pointer"
                        onClick={()=> openEditor("tier")}
                        />
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg justify-between">
                        <span className="font-semibold text-white">Address: {cls.address}</span> 
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg justify-between">
                        <span className="font-semibold text-white">Contact Number: {cls.contact_number}</span> 
                    </div>
                     <div className="bg-gray-700 p-3 rounded-lg justify-between">
                        <span className="font-semibold text-white">Emergency Contact: {cls.emergency_contact}</span> 
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg justify-between">
                        <span className="font-semibold text-white">Membership Status: {memberData.memberships?.[0]?.status || "None"}</span> 
                    </div>
                </div>

                <div className="mt-5">
                    <button
                        onClick={onClose}
                        className='w-full px-4 py-2 bg-slate-200 text-black rounded-lg font-semibold'
                    >
                        Close Window
                    </button>
                </div>
            </div>



            {editingField && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className='bg-gray-800 p-5 rounded-lg w-80 border border-yellow-500'>
                        <h2 className='text-white text-lg font-bold mb-3 uppercase'>
                            Edit {editingField.replace("_", " ")}
                        </h2>
                        <input
                            className='w-full p-2 rounded bg-gray-700 text-white mb-4'
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                        />
                     <div className='flex gap-2'>
                        <button
                            className='flex-1 bg-red-500 p-2 rounded font-semibold text-black'
                            onClick={() => setEditingField(null)}
                        >
                        Cancel
                        </button>
                        <button
                            className='flex-1 bg-green-500 p-2 rounded font-semibold text-black'
                            onClick={saveEdit}
                        >
                        Save
                        </button>
                    </div>
                </div>
            </div>
            )}
            {showAlert &&(
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999]">
                    <CheckCircleIcon
                    className="text-green-600 w-20 h-20"/>
                </div>
            )}
        </div>
    );
};

export default MemberDetailsModal;
