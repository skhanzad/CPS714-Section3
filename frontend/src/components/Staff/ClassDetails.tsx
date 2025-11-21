import { PencilIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import { admin_supabase } from './supabaseClient';

  
//componentusage: used when user clickks on a specific class
const ClassDetailsModal = ({ cls, onClose, refreshClasses }: { cls: any, onClose: () => void, refreshClasses : () => void}) => {
  const [editingField, setEditingField] = useState<null | string>(null); //editing field will be things like: class type, instructor fname, instructor lname, time, day and capacity
  const [editValue, setEditValue] = useState("");  
  const [showAlert, setShowAlert] = useState(false);


  if (!cls) return null  

  //Editing Window
  const openEditor = (field: string, currentValue: string) => {
    
    //edge case: don't open the editor for null/undefined values
    if (currentValue == null){
      console.warn(`Cannot edit ${field}. Value is Null or Undefined`);
      return;
    }
    setEditingField(field); //the column value for the class we are updating in the db
    setEditValue(currentValue);
  }

  //Update the supabase backend when an admin makes changes to certain fields
  const saveEdit = async() => {
    if (!editingField) return;

    //if the value didn't change green checkmark popup shouldn't happen. (avoids confusion for user)
    if (editValue.trim() === ""){
       alert("Value cannot be empty.");
        return; 
    }
    //if the value didn't change green checkmark popup shouldn't happen. (avoids confusion for user)
    if (editValue == cls[editingField]){
        setEditingField(null);
        setEditValue("");
        return; 
    }

    try{
      const {error} = await admin_supabase
      .from("class")
        .update({[editingField]: editValue})
        .eq("id", cls.id)

        if (error) throw error;

        setShowAlert(true); //notee: checkmark popup to show updates have been made

        setTimeout(() => 
            {
            setShowAlert(false);
            setEditingField(null);
            },
            1000 
        ); //settimeout 2nd argument is in ms
        try{
          cls[editingField] = editValue; //update to the new value inside teh editor as well
          refreshClasses();
        }catch (error){
          console.error("Failed to refresh classes. Please try again", error);
        }
        setEditValue("");
    } catch (err: any){
      console.log(err)
      alert("failed to update the class, sorry");
    }
  }

  const deleteClass = async (classId : string) => {
    try{

      //don't delete if class id is invalid/undefined
      if (!classId) {
        alert("Invalid Class ID");
        return;
      }
      //ask user confirmation before delete
      if(!confirm("Are you sure you want to delete this class?")) return;

      const {error, count} = await admin_supabase
        .from("class")
        .delete({count: "exact"}) //(counting rows)
        .eq("id", classId)
        .select("*"); //(need select for count)
        
      if (error) throw error;

      //edge case handlinng:
      if (count == 0){
        alert("Class Does not Exist or was already deleted");
        return;
      }

      alert("Class was succesfully deleted");
      onClose();// close the modal
      
      try{
        refreshClasses(); //trigger parent refresh
      }catch (e){
        console.error("Failed to refresh classes");
      }
      
      }catch (err: any){
        console.error("Delete error", err)
        alert(err.message || "Error deleting class");
      }
  };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-yellow-500 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold tracking-wide text-white">{cls.class_name}</h3>
          <button onClick={onClose} className="text-white text-xl">x</button>
        </div>
        <div className="space-y-1 text-sm text-slate-200 leading-6">
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Class Type: {cls.class_type}</span>
              <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("class_type", cls.class_type)}
              />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Instructor First Name: {cls.instructor_fname}</span>
                <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("instructor_fname", cls.instructor_fname)}
                />
            </div>
             <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Instructor Last Name: {cls.instructor_lname}</span>
                <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("instructor_lname", cls.instructor_lname)}
                />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Date: {cls.day}</span>
                <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("day", cls.day)}
                />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Time: {cls.time.slice(0, -3)}</span>
              <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("time", cls.time)}
              />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white"> Class Capacity: {cls.capacity}</span>
              <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("capacity", cls.capacity)}
              />
            </div>
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Class Duration: {cls.duration} minutes</span>
              <PencilIcon
                className="cursor-pointer"
                onClick= {() => openEditor("duration", cls.duration)}
              />
            </div>   
            <div className="bg-gray-700 p-3 rounded-lg flex justify-between">
              <span className="font-semibold text-white">Total Bookings: {cls.total_bookings}</span>
            </div>         
          </div>

          <div className="mt-5">
                <button
                    onClick={onClose}
                    className='w-full px-4 py-2 bg-slate-200 text-black rounded-lg font-semibold'
                >
                    Close Window
                </button>

                <button
                    onClick={ () => deleteClass(cls.id)}
                    className='w-full mt-3 px-4 py-2 bg-red-500 text-black rounded-lg font-semibold'
                >
                    Delete Class
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

export default ClassDetailsModal;