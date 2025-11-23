// Simple count of the number of active members

import React, { useEffect, useState } from 'react';
import { getNumberActiveMembers } from '../analytics_service';

export const ActiveMembers: React.FC = () => {
    const [totalMembers, setTotalMembers] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const total: any = await getNumberActiveMembers();
                if (!mounted) return;
                setTotalMembers(Number(total ?? 0));
            } catch (e) {
                if (!mounted) return;
                setTotalMembers(0);
            }
        };

        fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    const formatted = typeof totalMembers === 'number' ? new Intl.NumberFormat().format(totalMembers) : null;

    return (
        <div className="w-full">
            {totalMembers === null ? (
                <div className="animate-pulse flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-slate-700" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-slate-700 rounded w-32" />
                        <div className="h-6 bg-slate-700 rounded w-20" />
                    </div>
                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>

                    <div>
                        <div className="text-xs uppercase text-slate-300">Active Memberships</div>
                        <div className="mt-1 text-2xl font-bold text-white">{formatted}</div>
                        <div className="text-sm text-slate-400">Currently active gym memberships</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveMembers;