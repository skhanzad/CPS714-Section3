import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Activity, TrendingUp, Clock, Users, AlertCircle } from 'lucide-react';

export const FacilityTracker = () => {
  const { user } = useAuth();
  const [gymCapacity, setGymCapacity] = useState<any>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [myWaitlist, setMyWaitlist] = useState<any[]>([]);

  useEffect(() => {
    fetchGymCapacity();
    fetchEquipment();
    fetchMyWaitlist();

    const capacityInterval = setInterval(fetchGymCapacity, 30000);
    return () => clearInterval(capacityInterval);
  }, []);

  const fetchGymCapacity = async () => {
    const { data } = await supabase
      .from('gym_capacity_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setGymCapacity(data);
  };

  const fetchEquipment = async () => {
    const { data } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    setEquipment(data || []);
  };

  const fetchMyWaitlist = async () => {
    const { data } = await supabase
      .from('equipment_waitlist')
      .select('*, equipment(*)')
      .eq('user_id', user?.id)
      .eq('status', 'waiting')
      .order('joined_at', { ascending: false });

    setMyWaitlist(data || []);
  };

  const joinWaitlist = async (equipmentId: string) => {
    try {
      const { error } = await supabase.from('equipment_waitlist').insert({
        user_id: user?.id,
        equipment_id: equipmentId,
        status: 'waiting',
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Joined Waitlist',
        message: "You've been added to the equipment waitlist. We'll notify you when it's available.",
        type: 'info',
      });

      fetchMyWaitlist();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const leaveWaitlist = async (waitlistId: string) => {
    try {
      const { error } = await supabase
        .from('equipment_waitlist')
        .update({ status: 'cancelled' })
        .eq('id', waitlistId);

      if (error) throw error;
      fetchMyWaitlist();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isOnWaitlist = (equipmentId: string) => {
    return myWaitlist.some((w) => w.equipment_id === equipmentId);
  };

  const getCapacityStatus = () => {
    if (!gymCapacity) return { label: 'Unknown', color: 'bg-slate-500', icon: Activity };

    const percentage = (gymCapacity.current_count / gymCapacity.max_capacity) * 100;

    if (percentage < 30) {
      return { label: 'Quiet', color: 'bg-green-500', icon: Activity, percentage };
    } else if (percentage < 70) {
      return { label: 'Busy', color: 'bg-amber-500', icon: TrendingUp, percentage };
    } else {
      return { label: 'Packed', color: 'bg-red-500', icon: AlertCircle, percentage };
    }
  };

  const getEquipmentStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 0) return 'text-amber-600';
    return 'text-red-600';
  };

  const capacityStatus = getCapacityStatus();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Facility Status</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Current Gym Capacity
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-full ${capacityStatus.color} flex items-center justify-center`}>
            <capacityStatus.icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-slate-900">{capacityStatus.label}</span>
              <span className="text-sm text-slate-600">
                {gymCapacity?.current_count || 0} / {gymCapacity?.max_capacity || 100} people
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${capacityStatus.color} transition-all duration-500`}
                style={{ width: `${capacityStatus.percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          Last updated: {gymCapacity ? new Date(gymCapacity.logged_at).toLocaleTimeString() : 'N/A'}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          Equipment Availability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {equipment.map((item) => {
            const waitlisted = isOnWaitlist(item.id);
            const statusColor = getEquipmentStatus(item.available_units, item.total_units);

            return (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-600 capitalize">{item.category}</p>
                  </div>
                  <span className={`text-2xl font-bold ${statusColor}`}>
                    {item.available_units}/{item.total_units}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-full ${
                      item.available_units > item.total_units / 2
                        ? 'bg-green-500'
                        : item.available_units > 0
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    } transition-all duration-500`}
                    style={{ width: `${(item.available_units / item.total_units) * 100}%` }}
                  />
                </div>

                {item.available_units === 0 && !waitlisted && (
                  <button
                    onClick={() => joinWaitlist(item.id)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Join Waitlist
                  </button>
                )}

                {waitlisted && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-medium">On Waitlist</span>
                    <button
                      onClick={() => {
                        const waitlistItem = myWaitlist.find((w) => w.equipment_id === item.id);
                        if (waitlistItem) leaveWaitlist(waitlistItem.id);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Leave
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {myWaitlist.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">My Waitlist</h3>
          <div className="space-y-2">
            {myWaitlist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{item.equipment.name}</p>
                  <p className="text-sm text-slate-600">
                    Joined {new Date(item.joined_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => leaveWaitlist(item.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                >
                  Leave
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
