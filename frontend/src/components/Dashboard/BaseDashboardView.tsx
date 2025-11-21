import { MembershipBanner } from './DashboardViewComponents/MembershipBanner';
import { UpcomingClasses } from './DashboardViewComponents/UpcomingClasses';
import { AchvFeed } from './DashboardViewComponents/AchvFeed';
import { ClassCalendar } from './DashboardViewComponents/ClassCalendar';
import { Database } from '../../lib/supabase';

type Subscription = Database['public']['Tables']['membership_subscriptions']['Row'] & {
  membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
};

interface BaseDashboardViewProps {
  subscription: Subscription | null | undefined;
  userId: string;
  sendToProfile: () => void;
}

export const BaseDashboardView = ({ subscription, userId, sendToProfile }: BaseDashboardViewProps) => {
  return (
    <div className="space-y-6">
      {/* Membership Status Widget */}
      <MembershipBanner
        subscription={subscription}
        sendToProfile={sendToProfile}
      />

      {/* Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-96">
        <UpcomingClasses userId={userId} />

        {/* Gym Acheivement Feed (Maybe goals we've acheived idk) */}
        <AchvFeed userId={userId}/> {/* THIS WAS UPDATED */}
      </div>
      {/* Add a stock image of a gym for more asthetics and seperation */}
      <div className="relative rounded-2xl border border-gray-700/50 overflow-hidden h-56">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1689877020200-403d8542d95d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
      </div>
      {/* Add the Class Calendar component to the page  */}
      <div id="class-calendar" className="stagger-2">
        <ClassCalendar userId={userId} />
      </div>
    </div>
  );
};