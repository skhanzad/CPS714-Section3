/*
This component displays a modal listing all FitHub administrators and provides a button for closing the window.
 */

import { SparkleIcon } from "lucide-react";

const ViewAdmins = ({onClose}: {onClose: () => void}) => {
  const admins = [
    {id: 1,full_name: 'Reyhan Emik'},
    {id: 2,full_name: 'Rana Hamood'},
    {id: 3,full_name: 'Nafia Rahman'},
    {id: 4,full_name: 'Alaa Yafaoui'},
    {id: 5,full_name: 'Jasmine Jawanda'},
  ];

  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-200 rounded-xl border-8 border-slate-700 p-6 max-w-md w-full m-4"> 
        <h3 className="text-xl font-bold text-slate-800 mb-4">FitHub Administrators</h3>
        <div className="space-y-2">

          {admins.map((admin) => (
            <div
              key={admin.id}
              className="p-3 bg-slate-200 rounded-lg text-slate-900"
            >
            <div className="flex items-center gap-2 ">
                <SparkleIcon className="w-4 h-4" />
                <span>{admin.full_name}</span>
            </div>
            </div>
          ))}

        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-yellow-600 text-black rounded-lg font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );

};

export default ViewAdmins; 