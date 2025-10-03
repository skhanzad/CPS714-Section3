import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, TrendingUp, DollarSign, Plus, Bell, BarChart3 } from 'lucide-react';

export const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalClasses: 0,
    todayBookings: 0,
  });
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [profiles, subscriptions, classes, bookings] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('membership_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('fitness_classes').select('id', { count: 'exact' }),
      supabase
        .from('class_bookings')
        .select('id', { count: 'exact' })
        .eq('status', 'confirmed')
        .gte('booked_at', new Date().toISOString().split('T')[0]),
    ]);

    setStats({
      totalMembers: profiles.count || 0,
      activeMembers: subscriptions.count || 0,
      totalClasses: classes.count || 0,
      todayBookings: bookings.count || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Staff Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddClass(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
          <button
            onClick={() => setShowAnnouncement(true)}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Announce
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Total Members</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalMembers}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Active Subscriptions</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.activeMembers}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Total Classes</span>
            <Calendar className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalClasses}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Today's Bookings</span>
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.todayBookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMembers />
        <PopularClasses />
      </div>

      {showAddClass && <AddClassModal onClose={() => setShowAddClass(false)} />}
      {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} />}
    </div>
  );
};

const RecentMembers = () => {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentMembers();
  }, []);

  const fetchRecentMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, membership_subscriptions(*, membership_tiers(name))')
      .order('created_at', { ascending: false })
      .limit(5);

    setMembers(data || []);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Members</h3>
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">{member.full_name}</p>
              <p className="text-sm text-slate-600">
                {member.membership_subscriptions[0]?.membership_tiers?.name || 'No subscription'}
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {new Date(member.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PopularClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchPopularClasses();
  }, []);

  const fetchPopularClasses = async () => {
    const { data } = await supabase
      .from('fitness_classes')
      .select('*, class_schedules(current_bookings)')
      .order('name')
      .limit(5);

    const withBookings = (data || []).map((cls) => ({
      ...cls,
      totalBookings: cls.class_schedules.reduce((sum: number, s: any) => sum + s.current_bookings, 0),
    }));

    withBookings.sort((a, b) => b.totalBookings - a.totalBookings);
    setClasses(withBookings);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Popular Classes</h3>
      <div className="space-y-3">
        {classes.map((cls, index) => (
          <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{cls.name}</p>
                <p className="text-sm text-slate-600">{cls.instructor_name}</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700">{cls.totalBookings} bookings</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddClassModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    classId: '',
  });
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase.from('fitness_classes').select('*').order('name');
    setClasses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedClass = classes.find((c) => c.id === formData.classId);
      const startTime = formData.time;
      const endTime = new Date(
        new Date(`2000-01-01T${startTime}`).getTime() + selectedClass.duration_minutes * 60000
      )
        .toTimeString()
        .slice(0, 5);

      const { error } = await supabase.from('class_schedules').insert({
        class_id: formData.classId,
        scheduled_date: formData.date,
        start_time: startTime,
        end_time: endTime,
        status: 'scheduled',
        current_bookings: 0,
      });

      if (error) throw error;
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Schedule New Class</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Class</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.instructor_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnnouncementModal = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('announcements').insert({
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        is_active: true,
      });

      if (error) throw error;
      onClose();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Create Announcement</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
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
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
