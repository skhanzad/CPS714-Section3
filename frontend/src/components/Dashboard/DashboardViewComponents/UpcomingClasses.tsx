import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { GiWeightLiftingUp, GiRunningShoe } from 'react-icons/gi';
import { supabase } from '../../../lib/supabase';

interface UpcomingClassesProps {
  userId: string;
}

export const UpcomingClasses = ({ userId }: UpcomingClassesProps) => {
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetchUpcomingBookings(userId);
    }
  }, [userId]);

  const fetchUpcomingBookings = async (userId: string) => {
    const today = new Date();
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const { data, error } = await supabase
      .from('class_bookings')
      .select(`
        id,
        status,
        class_schedules (
          scheduled_date,
          start_time,
          fitness_classes ( name )
        )
      `)
      .eq('user_id', userId)
      .gte('class_schedules.scheduled_date', today.toISOString().split('T')[0])
      .lte('class_schedules.scheduled_date', sevenDaysFromNow.toISOString().split('T')[0])
      .order('scheduled_date', { foreignTable: 'class_schedules', ascending: true });

    if (error) console.error('Error fetching bookings:', error);
    else {
      const all = data || [];
      // Filter out bookings that somehow don't have the joined schedule relation
      const valid = all.filter((b: any) => b?.class_schedules != null).sort((a, b) => {
        const dateA = new Date(`${a.class_schedules.scheduled_date}T${a.class_schedules.start_time}`);
        const dateB = new Date(`${b.class_schedules.scheduled_date}T${b.class_schedules.start_time}`);
        return dateA.getTime() - dateB.getTime();
      });
      if (valid.length !== all.length) {
        console.warn('Some bookings were missing class_schedules and were filtered out:', all.filter((b: any) => b?.class_schedules == null));
      }
      setUpcomingBookings(valid);
    }
  };

  function formatTime(start_time: string): string {
    let hours = 0;
    let minutes = 0;
    let period = "";

    const parts_of_time = start_time.split(':').map(Number);

    if (parts_of_time[0] > 12) {
      hours = parts_of_time[0] - 12;
      period = "PM";
    }
    else {
      hours = parts_of_time[0];
      period = "AM";
    }
    minutes = parts_of_time[1];

    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return (
    <div className="bg-gray-800/90 border border-gray-700/50 hover:border-gold-500/30 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-1 stagger-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <GiRunningShoe className="w-6 h-6 text-gold-400" />
          Upcoming Classes In The Next <span className="text-gold-400">7 Days!</span>
        </h3>
      </div>

      <div className="mb-2 max-h-64 overflow-y-auto">
        {upcomingBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-700/30 rounded-xl border border-dashed border-gray-600">
            <p className="text-gray-400 mb-4">No upcoming classes booked</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking: any) => {
              const schedule = booking.class_schedules || booking.class_schedules;
              const className = schedule?.fitness_classes?.name || 'Unknown class';
              const scheduledDate = schedule?.scheduled_date
                ? schedule.scheduled_date.split('T')[0]
                : 'TBD';
              const startTime = formatTime(schedule?.start_time || '');

              return (
                <div
                  key={booking.id}
                  className="flex items-start justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-700/50 hover:border-gold-500/30 transition-all duration-200 hover:shadow-md hover:bg-gray-700/50"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-100 text-lg">{className}</p>
                    <p className="text-sm text-gray-300 flex items-center gap-1 mt-2">
                      <Clock className="w-4 h-4 text-gold-400" />
                      {scheduledDate}{startTime ? ` at ${startTime}` : ''}
                    </p>
                  </div>
                  <button className="badge-gold test-xs"
                    onClick={() => {
                      const scheduleElement = document.getElementById('class-calendar');
                      {/* Scroll down to the calendar view for upcoming classes */ }
                      scheduleElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>View</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View calendar button */}
      <button
        onClick={() => {
          const scheduleElement = document.getElementById('class-calendar');
          {/* Scroll down to the calendar view for upcoming classes */ }
          scheduleElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="group w-full mt-2 px-6 py-4 bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-gold-500/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        <GiWeightLiftingUp className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
        <span>View Schedule</span>
      </button>
    </div>
  );
};