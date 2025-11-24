import { useState, useEffect, useCallback } from 'react';
import { Users, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';

const API_BASE_URL = 'http://localhost:8000'; // Assuming the backend runs on port 8000

type Profile = Database['public']['Tables']['profiles']['Row'];

interface CapacityStatus {
  count: number;
  status: string;
  max_capacity: number;
}

interface WaitlistStatus {
  equipment: string;
  size: number;
  next: string | null;
  queue: string[];
}

const EQUIPMENT_TO_TRACK = ['Squat Rack', 'Bench Press', 'Treadmill', 'Leg Press'];

export const GymCapacity = () => {
  const [capacity, setCapacity] = useState<CapacityStatus | null>(null);
  const [waitlists, setWaitlists] = useState<WaitlistStatus[]>([]);
  const [loadingCapacity, setLoadingCapacity] = useState(true);
  const [loadingWaitlists, setLoadingWaitlists] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allMembers, setAllMembers] = useState<Profile[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [checkedInMemberIds, setCheckedInMemberIds] = useState<string[]>([]);
  
  // State for the dropdown in each waitlist card, keyed by equipment name
  const [selectedWaitlistMembers, setSelectedWaitlistMembers] = useState<Record<string, string>>({});

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error fetching members:', error);
        setAllMembers([]);
    } else {
        const memberData = data || [];
        setAllMembers(memberData);
    }
  }, []);


  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const fetchCapacity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/operations/capacity`);
      if (!response.ok) throw new Error('Failed to fetch capacity');
      const data: CapacityStatus = await response.json();
      setCapacity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCapacity(false);
    }
  };

  const fetchWaitlists = async () => {
    setLoadingWaitlists(true);
    try {
      const waitlistPromises = EQUIPMENT_TO_TRACK.map(name =>
        fetch(`${API_BASE_URL}/operations/waitlist/${name}`).then(res => res.json())
      );
      const results = await Promise.all(waitlistPromises);
      const validWaitlists = results.filter(r => r && r.equipment);
      setWaitlists(validWaitlists);
    } catch (err: any) {
      setError(`Failed to fetch waitlist data: ${err.message}`);
    } finally {
      setLoadingWaitlists(false);
    }
  };

  const fetchCheckedInUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/operations/checked-in-users`);
      const data = await response.json();
      setCheckedInMemberIds(data.checked_in_ids || []);
    } catch (err) {
      console.error("Failed to fetch checked-in users:", err);
    }
  };
  
  useEffect(() => {
    fetchCapacity();
    fetchWaitlists();
    fetchCheckedInUsers();
    const interval = setInterval(() => {
        fetchCapacity();
        fetchWaitlists();
        fetchCheckedInUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (url: string, body: object, options: { refetchUsers?: boolean } = { refetchUsers: true }) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Action failed');
        }
        await fetchCapacity();
        await fetchWaitlists();
        if (options.refetchUsers) {
            await fetchCheckedInUsers();
        }
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleNewMemberCheckIn = async () => {
    if (!newMemberName.trim()) {
        alert("Please enter a name for the new member.");
        return;
    }
    try {
        // Prevent checking in a name that is already checked in
        const memberNameMap = new Map(allMembers.map(m => [m.id, m.full_name]));
        const checkedInNames = checkedInMemberIds.map(id => memberNameMap.get(id)?.toLowerCase());
        if (checkedInNames.includes(newMemberName.trim().toLowerCase())) {
            alert(`${newMemberName.trim()} is already checked in.`);
            return;
        }

        // --- LOCAL BYPASS ---
        // We will not create a profile in Supabase to avoid foreign key errors.
        // Instead, we generate an ID and call the check-in API directly.
        // The new member's info is added to the local state to update the UI.
        const newId = crypto.randomUUID();
        await handleAction(
            `${API_BASE_URL}/operations/check-in`,
            { member_id: newId },
            { refetchUsers: false } // We will update users manually
        );

        // Manually update both states together to prevent race conditions
        setAllMembers(prev => [...prev, { id: newId, full_name: newMemberName.trim(), avatar_url: null, updated_at: null, username: null, website: null }]);
        setCheckedInMemberIds(prev => [...prev, newId]);
        setNewMemberName('');

    } catch (err: any) {
        console.error("New member check-in failed:", err);
        alert((err as Error).message || "An error occurred during new member check-in.");
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Quiet': return 'text-green-400';
      case 'Busy': return 'text-yellow-400';
      case 'Packed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const memberNameMap = new Map(allMembers.map(m => [m.id, m.full_name]));
  const checkedInMembers = allMembers.filter(member => 
    checkedInMemberIds.includes(member.id)
  );
  
  // Create a set of all member IDs that are currently on ANY waitlist.
  const memberIdsOnAnyWaitlist = new Set(waitlists.flatMap(list => list.queue || []));
  // Filter the list of checked-in members to exclude those already on a waitlist.
  const membersAvailableForWaitlist = checkedInMembers.filter(member => !memberIdsOnAnyWaitlist.has(member.id));

  return (
    <div className="text-white">
        <h2 className="text-2xl font-bold mb-6 text-gold-400">Gym Activity</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 md:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Live Occupancy</h3>
                {loadingCapacity ? <Loader className="animate-spin" /> : capacity && (
                    <div>
                        <div className={`text-5xl font-bold ${getStatusColor(capacity.status)}`}>{capacity.status}</div>
                        <div className="flex items-center gap-2 mt-2 text-lg">
                            <Users className="text-gray-400" />
                            <span>{capacity.count} / {capacity.max_capacity} Members</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="md:col-span-2 space-y-4">
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <label htmlFor="new-member-name" className="block text-sm font-medium text-gray-300 mb-2">Member Check-in</label>
                    <div className="flex gap-2">
                        <input
                            id="new-member-name"
                            type="text"
                            value={newMemberName}
                            onChange={e => setNewMemberName(e.target.value)}
                            className="flex-grow px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder:text-slate-400"
                            placeholder="Enter full name"
                        />
                        <button
                            onClick={handleNewMemberCheckIn}
                            disabled={!newMemberName.trim()}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            Check In
                        </button>
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <label htmlFor="checkout-member-select" className="block text-sm font-medium text-gray-300 mb-2">Member Check-out</label>
                    <div className="flex gap-2">
                        <select 
                            id="checkout-member-select"
                            value={selectedWaitlistMembers['global_checkout'] || ''}
                            onChange={e => setSelectedWaitlistMembers(prev => ({...prev, global_checkout: e.target.value}))}
                            className="flex-grow px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white"
                        >
                            <option value="">-- Select Checked-in Member --</option>
                            {checkedInMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.full_name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                const memberId = selectedWaitlistMembers['global_checkout'];
                                const isMemberOnAnyWaitlist = waitlists.some(list => list.queue?.includes(memberId));
                                if (isMemberOnAnyWaitlist) {
                                    alert("Member must leave all waitlists before checking out.");
                                    return;
                                }
                                // Call the backend to check out the user
                                handleAction(`${API_BASE_URL}/operations/check-out`, { member_id: memberId }, { refetchUsers: false });

                                // Manually remove the user from local state for an instant UI update
                                setCheckedInMemberIds(prev => prev.filter(id => id !== memberId));
                                setAllMembers(prev => prev.filter(member => member.id !== memberId));
                                // Clear the selection in the dropdown
                                setSelectedWaitlistMembers(prev => ({...prev, global_checkout: ''}));
                            }}
                            disabled={!selectedWaitlistMembers['global_checkout']}
                            className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            Check Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg mb-6">{error}</div>}
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Equipment Waitlists</h3>
            {loadingWaitlists ? <Loader className="animate-spin" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(waitlists || []).map(item => {
                        return (
                        <div key={item.equipment} className="bg-gray-700/50 p-4 rounded-lg flex flex-col">
                            <h4 className="font-bold text-white">{item.equipment}</h4>
                            <p className="text-gray-400 text-sm mb-3">
                                Waiting: {Math.max(0, item.size - 1)} | <span className="font-semibold text-gray-300">Active User:</span> {item.next ? memberNameMap.get(item.next) || '...' : 'None'}
                            </p>
                            
                            <div className="flex-grow space-y-1 mb-3 min-h-[60px]">
                                {(item.queue || []).length > 1 ? (
                                    (item.queue || []).slice(1).map((id, index) => (
                                        <div key={id} className="text-xs text-slate-300 bg-gray-600/50 rounded px-2 py-1">
                                            {index + 1}. {memberNameMap.get(id) || `ID: ${id.substring(0,8)}...`}
                                        </div>
                                    ))
                                ) : (
                                  <div className="text-xs text-slate-500 italic">(Empty)</div>
                                )}
                            </div>

                            <div className="mt-auto space-y-2">
                                <select 
                                    value={selectedWaitlistMembers[item.equipment] || ''}
                                    onChange={e => setSelectedWaitlistMembers(prev => ({
                                        ...prev,
                                        [item.equipment]: e.target.value
                                    }))}
                                    className="w-full text-xs px-2 py-1 rounded-md bg-gray-600 border border-gray-500 text-white"
                                >
                                    <option value="">-- Select Member --</option>
                                    {membersAvailableForWaitlist.map(member => (
                                        <option key={member.id} value={member.id}>{member.full_name}</option>
                                    ))}
                                </select>
                                <div className="flex gap-2">
                                <button 
                                        onClick={() => handleAction(`${API_BASE_URL}/operations/waitlist/join`, { equipment_name: item.equipment, member_id: selectedWaitlistMembers[item.equipment] })}
                                        disabled={!selectedWaitlistMembers[item.equipment]}
                                    className="text-xs bg-gold-600 hover:bg-gold-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50">
                                    Join
                                </button>
                                <button 
                                        onClick={() => {
                                            const memberToLeaveId = item.queue?.[0]; // The first person in the queue
                                            if (memberToLeaveId) {
                                                handleAction(`${API_BASE_URL}/operations/waitlist/leave`, { equipment_name: item.equipment, member_id: memberToLeaveId });
                                            }
                                        }}
                                        disabled={!item.queue || item.queue.length === 0}
                                    className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded disabled:opacity-50">
                                    Leave
                                </button>
                                </div>
                            </div>
                        </div>
                    )
                }
                )}
                </div>
            )}
        </div>
    </div>
  );
};
