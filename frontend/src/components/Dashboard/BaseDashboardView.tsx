/**
 * Base Dashboard View Component:
 * This component serves as the foundational layout for the member dashboard,
 * incorporating membership status, upcoming classes, an achievement feed, and a class calendar.
 * It receives user subscription data and user ID as props to customize the displayed information.
 * 
 * The base dashboard receives the following props:
 * - subscription: An object containing the user's membership subscription details, i.e. the membership tier.
 * - userId: A string representing the unique identifier of the user. This is used to fetch user-specific data 
 *           from Supabase and display user related information.
 * - sendToProfile: A function that navigates the user to their profile page.
 * 
 * The component integrates several sub-components:
 * - MembershipBanner: Displays the user's membership status and provides a link to the profile page.
 * - UpcomingClasses: Shows a list of the user's upcoming class bookings within the next 7 days.
 * - AchvFeed: Displays the user's gym achievements feed as well as achievements that are in progress for the user.
 * - ClassCalendar: Provides a calendar view of the user's scheduled classes, organized weekly.
 * 
 * @param {Subscription | null | undefined} subscription - The user's membership subscription details including the membership tier.
 * @param {string} userId - The unique identifier of the user for fetching user-specific data.
 * @param sendToProfile - Callback function to navigate the user to their profile page.
 * 
 * @returns A JSX element representing the Base Dashboard View interface.
 */

import { MembershipBanner } from './DashboardViewComponents/MembershipBanner';
import { UpcomingClasses } from './DashboardViewComponents/UpcomingClasses';
import { AchvFeed } from './DashboardViewComponents/AchvFeed';
import { ClassCalendar } from './DashboardViewComponents/ClassCalendar';
import { ChallengeLeaderboard } from './DashboardViewComponents/Leaderboard';
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
    <div className="space-y-4">
      {/* Membership Status Widget */}
      <MembershipBanner
        subscription={subscription}
        sendToProfile={sendToProfile}
      />

      {/* Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-96">
        <UpcomingClasses userId={userId} />

        {/* Gym Acheivement Feed (Maybe goals we've acheived idk) */}
        <AchvFeed userId={userId}/> {/* THIS WAS UPDATED */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-96">
        <ChallengeLeaderboard userId={userId} />


      </div>
      {/* Add a stock image of a gym for more asthetics and seperation */}
      <div className="relative rounded-2xl border border-gray-700/50 overflow-hidden h-56">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1689877020200-403d8542d95d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        />
        <div className="absolute inset-0" />
      </div>
      {/* Add the Class Calendar component to the page  */}
      <div id="class-calendar" className="stagger-2">
        <ClassCalendar userId={userId} />
      </div>
    </div>
  );
};