import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, Users, X, Check, Star } from 'lucide-react';

export const ClassBooking = () => {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchSchedules();
    fetchMyBookings();
  }, [selectedDate, user]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('fitness_classes')
      .select('*')
      .order('name');
    setClasses(data || []);
  };

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from('class_schedules')
      .select('*, fitness_classes(*)')
      .eq('scheduled_date', selectedDate)
      .eq('status', 'scheduled')
      .order('start_time');
    setSchedules(data || []);
  };

  const fetchMyBookings = async () => {
    const { data } = await supabase
      .from('class_bookings')
      .select('*, class_schedules(*, fitness_classes(*))')
      .eq('user_id', user?.id)
      .eq('status', 'confirmed');
    setMyBookings(data || []);
  };

  const isBooked = (scheduleId: string) => {
    return myBookings.some((b) => b.schedule_id === scheduleId);
  };

  const canBook = (classData: any) => {
    const subscription = profile?.membership_subscriptions?.[0];
    const tier = subscription?.membership_tiers;

    if (!tier) return false;

    if (classData.is_premium && !tier.can_book_premium_classes) {
      return false;
    }

    return true;
  };

  const bookClass = async (scheduleId: string, classData: any) => {
    if (!canBook(classData)) {
      alert('Your membership tier does not allow booking this class. Please upgrade to Premium or VIP.');
      return;
    }

    setLoading(true);
    try {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (schedule.current_bookings >= schedule.fitness_classes.capacity) {
        alert('This class is fully booked');
        return;
      }

      const { error: bookingError } = await supabase.from('class_bookings').insert({
        user_id: user?.id,
        schedule_id: scheduleId,
        status: 'confirmed',
      });

      if (bookingError) throw bookingError;

      const { error: updateError } = await supabase
        .from('class_schedules')
        .update({ current_bookings: schedule.current_bookings + 1 })
        .eq('id', scheduleId);

      if (updateError) throw updateError;

      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Class Booked',
        message: `You've successfully booked ${classData.name} on ${selectedDate}`,
        type: 'success',
      });

      fetchSchedules();
      fetchMyBookings();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, scheduleId: string) => {
    setLoading(true);
    try {
      const { error: cancelError } = await supabase
        .from('class_bookings')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (cancelError) throw cancelError;

      const schedule = schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        await supabase
          .from('class_schedules')
          .update({ current_bookings: Math.max(0, schedule.current_bookings - 1) })
          .eq('id', scheduleId);
      }

      fetchSchedules();
      fetchMyBookings();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getNextWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Book a Class</h2>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {getNextWeekDays().map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`px-4 py-3 rounded-lg whitespace-nowrap transition ${
                selectedDate === day.date
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No classes scheduled for this date</p>
          </div>
        ) : (
          schedules.map((schedule) => {
            const booking = myBookings.find((b) => b.schedule_id === schedule.id);
            const booked = !!booking;
            const canBookClass = canBook(schedule.fitness_classes);
            const isFull = schedule.current_bookings >= schedule.fitness_classes.capacity;

            return (
              <div
                key={schedule.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {schedule.fitness_classes.name}
                          </h3>
                          {schedule.fitness_classes.is_premium && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {schedule.fitness_classes.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {schedule.start_time} - {schedule.end_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {schedule.current_bookings} / {schedule.fitness_classes.capacity}
                          </span>
                          <span>Instructor: {schedule.fitness_classes.instructor_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {booked ? (
                      <button
                        onClick={() => cancelBooking(booking.id, schedule.id)}
                        disabled={loading}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => bookClass(schedule.id, schedule.fitness_classes)}
                        disabled={loading || !canBookClass || isFull}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        {isFull ? 'Full' : !canBookClass ? 'Upgrade Required' : 'Book'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {myBookings.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">My Upcoming Classes</h3>
          <div className="space-y-3">
            {myBookings
              .filter((b) => new Date(b.class_schedules.scheduled_date) >= new Date())
              .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.class_schedules.fitness_classes.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(booking.class_schedules.scheduled_date).toLocaleDateString()} at{' '}
                      {booking.class_schedules.start_time}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                    Confirmed
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
