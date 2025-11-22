import { useState, useEffect } from 'react';
import { admin_supabase } from './supabaseClient';
import { Plus, Bell, UserIcon, PencilIcon } from 'lucide-react';
import { FaDumbbell } from "react-icons/fa";
import MemberManagement from './MemberManagement';
import ReportsAnalytics from './ReportsAnalytics'; 
import ViewAdmins from './Admins';
import AddClassModal from './AddClass';
import ClassManagement from './ClassManagement';
import CreateChallengePage from './CreateChallenge';

export const StaffDashboard = () => {

  const [showViewAdmins, setshowViewAdmins] = useState(false); //hide all modals (only open on click)
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const triggerRefresh = () => setRefreshFlag((prev) => !prev)


  return (
    <div className="min-h-screen bg-gray-900 text-slate-500 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className='flex items-center gap-2'>
          <FaDumbbell className='w-7 h-7 text-yellow-500 relative -top-0.5'/>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">Staff Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setshowViewAdmins(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            View Admins
          </button>
          <button
            onClick={() => setShowAddClass(true)} //update state
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
          <button
            onClick={() => setShowAnnouncement(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Announce
          </button>
          {/*Create Challenge button*/}
          <button
            onClick={() => setShowCreateChallenge(true)} //update state
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-500 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </button> 
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberManagement />
        <ClassManagement refreshFlag={refreshFlag}/>
      </div>
      <div className="mb-6">
        <ReportsAnalytics/>
      </div>
      {showViewAdmins && <ViewAdmins onClose={() => setshowViewAdmins(false)}/>} 
      {showAddClass && <AddClassModal onClose={() => setShowAddClass(false)} refreshClasses={triggerRefresh} />}
      {showCreateChallenge && <CreateChallengePage onClose={() => setShowCreateChallenge(false)} refreshClasses={triggerRefresh} />}
    </div>
  );
};

