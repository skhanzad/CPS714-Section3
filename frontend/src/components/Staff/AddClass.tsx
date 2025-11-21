

import { useState } from "react";
import { admin_supabase } from './supabaseClient';
import { CheckCircleIcon } from "lucide-react";
//COMPONENT: ADD CLASS FEAUTURE

const AddClassModal = ({ onClose, refreshClasses }: { onClose: () => void, refreshClasses: () => void }) => {
  const [formData, setFormData] = useState({
    classId: '',
    first_name: '',
    last_name: '',
    capacity: '',
    date: '',
    time: '',
    class_type: '',
    duration: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //destructure the hour and mins from time and extract to check class start times fall in range 9 am and 9 pm
    const [hours, mins] = formData.time.split(":").map(Number);
    if (!formData.time || hours < 9 || hours > 21){
      alert("Class start times are between 9:00 and 21:00");
      return;
    }
    if (!formData.classId.trim()){
      alert("Class name cannot be empty");
      return;
    }
    try {
      const { error } = await admin_supabase.from('class').insert({
        class_name: formData.classId.trim(),
        class_type: formData.class_type.trim().toUpperCase(),
        instructor_fname: formData.first_name.trim(), 
        instructor_lname: formData.last_name.trim(),
        capacity: formData.capacity,
        day: formData.date,
        time: formData.time,
        duration: formData.duration,

        
      });

      if (error) throw error;
      setShowAlert(true);

      setTimeout(()=> {
        setShowAlert(false)
        refreshClasses();
        onClose();
        }, 500);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-200 rounded-xl border-8 border-slate-700 p-6 max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Schedule New Class</h3>
            <button onClick={onClose} className="text-black text-xl">x</button>
          </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Class</label>
            <input
              type="text"
              value={formData.classId}
              onChange={(e) => {
                if (!/^[a-zA-Z0-9\s\-]*$/.test(e.target.value))  // only allowing the following: a-z, A-Z, numbers, single whitespace and hyphen
                {
                  alert("Input for the 'Class' field is invalid." + "\nOnly Letters, Numbers, hypen and single white space is permitted")
                  return; 
                }
                setFormData({ ...formData, classId: e.target.value })            
                }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              placeholder="ex: Boxing and Kickboxing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Class Type</label>
            <input
              type="text"
              value={formData.class_type} 
              onChange={(e) => {
                if (!/^[a-zA-Z]*$/.test(e.target.value)) //validate input
                {
                  alert("Only enter string characters");
                  return; 
                }
                setFormData({ ...formData, class_type: e.target.value })
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 italic"
              required
              placeholder="ex: BASIC, PREMIUM, VIP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Instructor First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => {
                if (!/^[a-zA-Z]*$/.test(e.target.value)) //validate input
                {
                  alert("Only enter string characters");
                  return; 
                }
                setFormData({ ...formData, first_name: e.target.value })
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 italic"
              required
              placeholder="ex: Nico"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Instructor Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => {
                if (!/^[a-zA-Z]*$/.test(e.target.value)) //validate input
                {
                  alert("Only enter string characters");
                  return; 
                }
                setFormData({ ...formData, last_name: e.target.value })
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 italic"
              required
              placeholder="ex: Ali Walsh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Set Class Capacity</label>
            <input
              type="number"
              min="0"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 italic"
              required
              placeholder="ex: 14"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Start Time (9 AM - 9 PM)</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => {
                const t = e.target.value;
                setFormData({ ...formData, time: e.target.value })
            }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-yellow-600 mb-2">Class Duration (minutes)</label>
            <input
              type="number"
              min="0"
              max="121"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Duration (minutes, max 120)"
            />
          </div>
          

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999]">
          <CheckCircleIcon
            className="text-green-600 w-20 h-20"
          />
        </div>
      )}
    </div>
  );
};
export default AddClassModal;