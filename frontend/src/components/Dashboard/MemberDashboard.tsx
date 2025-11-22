import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Bell,
  LogOut,
} from 'lucide-react';
import { GiBiceps } from 'react-icons/gi';
import { FaDumbbell } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/supabase';
import { ProfileEditor } from './ProfileEditor';
import { BaseDashboardView } from './BaseDashboardView';

type TabType = 'dashboard' | 'profile';

// Define a specific type for the profile object, including the nested subscription data.
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
  // membership_subscriptions is returned as an array when selecting relations
  membership_subscriptions: (Database['public']['Tables']['membership_subscriptions']['Row'] & {
    membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
  })[] | null;
};

export const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [notifications] = useState<any[]>([]);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [myProfile, setMyProfile] = useState<ProfileWithSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showProfileMenu && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      // place the menu so its right edge aligns with the button's right edge
      const menuWidth = 224; // matches minWidth used when rendering
      setMenuPos({ top: rect.bottom + window.scrollY, left: rect.right - menuWidth + window.scrollX });
    }
  }, [showProfileMenu]);

  useEffect(() => {
    const HARDCODED_USER_ID = 'b41c76d2-0e38-4dec-8825-b10a0b841664';

    const fetchProfileData = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, membership_subscriptions(*, membership_tiers(*))')
          .eq('id', HARDCODED_USER_ID)
          .single();

        if (error) throw error;

        setMyProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error.message);
      }
      setLoading(false);
    };
    fetchProfileData();
  }, []);


  /* User data */
  const subscription = myProfile?.membership_subscriptions?.[0];
  // The profiles table uses `profile_picture_url` (see `supabase.ts`). Use that field if present.
  const profile_picture = myProfile?.profile_picture_url || null;
  const userId = myProfile?.id || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading Profile...
      </div>
    );
  }

  // If loading is finished but the profile couldn't be fetched, show an error.
  if (!myProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        Error: Could not load user profile. Please ensure that the database is linked properly.
      </div>
    );
  }

  /* Use initials if profile picture not found */
  const initials = (myProfile?.full_name || 'U').split(' ').map((p: string) => p[0]).slice(0, 2).join('');

  return (
    <div className="flex flex-col h-screen bg-gray-900 overflow-hidden">
      {/* Top Banner */}
      <header className="bg-gray-800/95 border-b border-gray-700/50 backdrop-blur-md shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* FITHUB LOGO */}
              <div className="bg-gold-500/90 p-2 rounded-lg shadow-md transition-all duration-300">
                <FaDumbbell className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-xl font-bold text-gold-400 tracking-tight">FitHub</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Section for dashboard and profile buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard'
                    ? 'bg-gold-500/90 text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-gold-400'
                    }`}
                >
                  <GiBiceps className="w-4 h-4 inline mr-1" />
                  Dashboard
                </button>
                {/* Send to the profile editor */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'profile'
                    ? 'bg-gold-500/90 text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-gold-400'
                    }`}
                >
                  <User className="w-4 h-4 inline mr-1" />
                  Profile
                </button>
              </div>

              {/* Notifications (Again haven't touched this at all) */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                  onBlur={() => setShowNotificationMenu(false)} // This will close the notifcication menu when clicking outside of it, but it also closes it when clicking inside, needs a better solution later
                  className="relative p-2 text-gray-400 hover:text-gold-400 transition-all duration-200 hover:bg-gray-700/50 rounded-lg">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full animate-pulse-gold shadow-lg shadow-gold-500/50"></span>
                  )}
                </button>

                {/* Notification drop down menu */}
                {showNotificationMenu && (
                  <div className="absolute right-0 w-56 h-60 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  </div>
                )}
              </div>

              {/* Sign drop down and banner */}
              <div className="relative">
                {/* Profile button ref used to position the portal dropdown */}
                <button
                  ref={(el) => (profileButtonRef.current = el)}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  onBlur={() => setShowProfileMenu(false)} // This keeps previous behaviour; portal positioning will prevent clipping
                  className="w-10 h-10 bg-gold-500/90 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm shadow-md hover:shadow-gold-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  {/* If a profile picture is defined then use it */}
                  {profile_picture ? (
                    <img src={profile_picture} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </button>

                {showProfileMenu && profileButtonRef.current && createPortal(
                  <div
                    className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                    style={{
                      position: 'absolute',
                      top: menuPos.top,
                      left: menuPos.left,
                      minWidth: 224,
                      zIndex: 2147483647, // very high to ensure front layer
                    }}
                  >
                    <div className="p-4 border-b border-gray-700">
                      <div className="text-sm font-bold text-gray-100 truncate">{myProfile?.full_name || 'User'}</div>
                      <div className="text-xs text-gray-400 truncate">{myProfile?.full_name || 'no-email@example.com'}</div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => alert('Sign out functionality removed.')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-red-400 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page - Swaps between Base Dashboard View and Prodile Editor*/}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === 'dashboard' && (<BaseDashboardView subscription={subscription} userId={userId} sendToProfile={() => setActiveTab('profile')} />)}
          {activeTab === 'profile' && <ProfileEditor profile={myProfile} returnProfileData={setMyProfile} />}
        </div>
      </main>
    </div>
  );
};