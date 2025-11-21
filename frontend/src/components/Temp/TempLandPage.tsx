import { useState } from 'react';
import { MemberDashboard } from '../Dashboard/MemberDashboard';
import { StaffDashboard } from '../Staff/StaffDashboard';

export const TempLandPage = () => {
    type Route = 'member' | 'staff' | 'temp';
    const [route, setRoute] = useState<Route>('temp');

    if (route === 'member') return <MemberDashboard />;
    else if (route === 'staff') return <StaffDashboard />;
    
    return (
        <main className="flex flex-col h-screen bg-gray-900 overflow-hidden justify-center items-center">
            <h3 className='text-white'> Welcome </h3>
            <button className="m-4 p-2 w-80 bg-gold-500 text-gray-900 rounded" onClick={() => {
                setRoute('member');
            }}>MEMBER</button>
            <button className="m-4 p-2 w-80 bg-gold-500 text-gray-900 rounded" onClick={() => {
                setRoute('staff');
            }}>STAFF</button>
        </main>
    );
};