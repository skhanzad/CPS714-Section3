import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Calendar,
  CreditCard,
  User,
  TrendingUp,
  Users,
  Award,
  Activity,
  Settings,
  Bell,
  LogOut,
  Dumbbell,
  Clock,
} from 'lucide-react';
import { ClassBooking } from '../Classes/ClassBooking';
import { ProfileEditor } from '../Profile/ProfileEditor';
import { SocialFeed } from '../Social/SocialFeed';
import { CommunityChallenges } from '../Social/CommunityChallenges';
import { FacilityTracker } from '../Facility/FacilityTracker';
import { StaffDashboard } from '../Staff/StaffDashboard';

type TabType = 'dashboard' | 'classes' | 'social' | 'challenges' | 'facility' | 'profile' | 'staff';

export const MemberDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalClasses: 0, thisMonth: 0, streak: 0 });

  useEffect(() => {
    if (user) {
      fetchUpcomingBookings();
      fetchNotifications();
      fetchStats();
    }
  }, [user]);

  const fetchUpcomingBookings = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('class_bookings')
      .select('*, class_schedules(*, fitness_classes(*))')
      .eq('user_id', user?.id)
      .eq('status', 'confirmed')
      .gte('class_schedules.scheduled_date', today)
      .order('class_schedules.scheduled_date', { ascending: true })
      .limit(5);

    setUpcomingBookings(data || []);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(5);

    setNotifications(data || []);
  };

  const fetchStats = async () => {
    const { data } = await supabase
      .from('class_bookings')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'attended');

    const total = data?.length || 0;
    const thisMonth = data?.filter((b: any) => {
      const bookedDate = new Date(b.booked_at);
      const now = new Date();
      return bookedDate.getMonth() === now.getMonth() && bookedDate.getFullYear() === now.getFullYear();
    }).length || 0;

    setStats({ totalClasses: total, thisMonth, streak: Math.min(total, 7) });
  };

  const subscription = profile?.membership_subscriptions?.[0];
  const tier = subscription?.membership_tiers;

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: TrendingUp },
    { id: 'classes' as TabType, label: 'Classes', icon: Calendar },
    { id: 'social' as TabType, label: 'Social', icon: Users },
    { id: 'challenges' as TabType, label: 'Challenges', icon: Award },
    { id: 'facility' as TabType, label: 'Facility', icon: Dumbbell },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    ...(profile?.is_staff ? [{ id: 'staff' as TabType, label: 'Staff Panel', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FitHub Elite</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 transition">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </aside>

          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                  <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
                  <p className="text-blue-100">
                    {tier?.name} Member • {stats.thisMonth} classes this month
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">Total Classes</span>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalClasses}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">This Month</span>
                      <Calendar className="w-5 h-5 text-cyan-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.thisMonth}</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">Day Streak</span>
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{stats.streak}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Upcoming Classes
                    </h3>
                    {upcomingBookings.length === 0 ? (
                      <p className="text-slate-500">No upcoming bookings</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingBookings.map((booking: any) => (
                          <div
                            key={booking.id}
                            className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">
                                {booking.class_schedules.fitness_classes.name}
                              </p>
                              <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                <Clock className="w-4 h-4" />
                                {new Date(booking.class_schedules.scheduled_date).toLocaleDateString()} at{' '}
                                {booking.class_schedules.start_time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-cyan-600" />
                      Membership Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Plan</span>
                        <span className="font-semibold text-slate-900">{tier?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                          {subscription?.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Renewal</span>
                        <span className="font-semibold text-slate-900">
                          {subscription?.renewal_date
                            ? new Date(subscription.renewal_date).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Price</span>
                        <span className="font-semibold text-slate-900">${tier?.price_monthly}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'classes' && <ClassBooking />}
            {activeTab === 'social' && <SocialFeed />}
            {activeTab === 'challenges' && <CommunityChallenges />}
            {activeTab === 'facility' && <FacilityTracker />}
            {activeTab === 'profile' && <ProfileEditor />}
            {activeTab === 'staff' && profile?.is_staff && <StaffDashboard />}
          </main>
        </div>
      </div>
    </div>
  );
};
