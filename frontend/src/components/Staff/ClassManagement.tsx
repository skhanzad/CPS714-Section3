/*
ClassManagement Description:
This component fetches and displays all classes in a collapsible list, 
allowing admins to open a detailed modal for editing or deleting a selected class, 
with refresh handled through Supabase data retrieval.
 */


import { useState, useEffect } from "react";
import { admin_supabase } from './supabaseClient';
import ClassDetailsModal from "./ClassDetails";


const ClassManagement = ({refreshFlag} : {refreshFlag: boolean}) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [openClass, setOpenClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);

  useEffect(() => {
    fetchAllClasses();
  }, [refreshFlag]);
  // when triggerrefresh() is called from addclassmodal refresh class management component where classes are displayed

  const fetchAllClasses = async () => {
    try{
      const { data, error } = await admin_supabase
        .from('class')
        .select('*')
        .order('class_name');
      
      if (error){
        console.log("Issues fetching classes: ", error);
        return;
      }
      if (data){
        const formatted_name = data.map((cls) => ({
          ...cls,
          instructor_name:  `${cls.instructor_fname ?? ""} ${cls.instructor_lname ?? ""}`.trim(),

        }));
        setClasses(formatted_name);
      }
    
  }catch (err){
   console.log("some error occured:", err);
  }
  };

  return (
     <div className="bg-gray-800 rounded-xl p-6 shadow-sm border border-yellow-500 self-start">
        <button
          onClick={() => setOpenClass(!openClass)}
          className="w-full text-left text-white font-bold text-lg mb-4 flex justify-between items-center"
        >
          Class Management 
          <span className="text-slate-300 text-l">{openClass ? '-' : '+'}</span> 
        </button>
       
        {openClass && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {classes.map((cls, index) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  setShowClassModal(true);
                }}
                className="w-full text-left p-3 bg-slate-50 rounded-lg flex items-center justify-between hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="inline font-semibold text-yellow-600">{cls.class_name}: </p>
                    <p className="inline text-xs text-slate-600">{cls.class_type}</p>
                    <p className="text-sm text-slate-600">Instructor: {cls.instructor_name}</p>
                    <p className="text-sm text-slate-600">Date: {cls.day}</p>
                    <p className="text-sm text-slate-600">Time: {cls.time.slice(0, -3)}</p> 
                    <p className="text-sm text-slate-600">Class Duration: {cls.duration} minutes</p> 
                  </div>
                </div>

                <span className="text-sm font-semibold text-slate-700">
                  Capacity: {cls.capacity} <br />Bookings: {cls.total_bookings}
                </span>
              </button>
            ))}
          </div>
        )}

      {showClassModal && (
        <ClassDetailsModal
          cls={selectedClass}
          onClose={() => { setShowClassModal(false); setSelectedClass(null);}}
          refreshClasses={fetchAllClasses}
        />
      )}
     </div>
    );
  };
export default ClassManagement;