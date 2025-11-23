/**
 * Achievement Feed Component for Dashboard:
 * This component fetches and displays the user's gym achievements from Supabase and allows
 * users to switch between viewing achieved and in-progress achievements.
 * The component conditionally renders the achievements based on the selected status and provides a button
 * to toggle between viewing achieved and in-progress achievements.
 * 
 * The component receives the following prop:
 * - userId: A string representing the unique identifier of the user. This is used to fetch user-specific achievement data from Supabase.
 * 
 * The following states are maintained within the component:
 * - achievements: An array of achievement objects fetched from the "achievements" database in Supabase.
 *                 The data retrieved includes the achievement ID, the title, description, and icon. 
 *                 Only the description and icon are used for displaying achievements on the dashboard.
 * - showAchievementStatus: A string indicating whether to display "achieved" or "in_progress" achievements,
 *                          which is fetched from the "user_achievements" database in Supabase.
 *                          This state is toggled via a button in the UI.
 * - loading: A boolean indicating whether the data is still being fetched.
 * 
 * The component uses the useEffect hook to fetch achievement data from Supabase when the component mounts or when the userId prop changes.
 * 
 * @param {string} userId - The unique identifier of the user for fetching user-specific achievement data.
 * 
 * @returns A JSX element representing the Achievement Feed interface.
 */

import { useState, useEffect } from 'react';
import * as Icons from "react-icons/gi";
import { GiMuscleUp, GiWeightScale } from 'react-icons/gi';
import { supabase } from '../../../lib/supabase';

interface Achievement {
  id: string;
  achievement_status: "achieved" | "in_progress";
  achievements: {
    description: string;
    icon: string;
  };
}

interface AchvFeedProps {
  userId: string;
}

export const AchvFeed = ({ userId }: AchvFeedProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAchievementStatus, setShowAchievementStatus] = useState<"achieved" | "in_progress">("achieved");

  useEffect(() => {
    if (userId) fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`*, achievements (*)`)
        .eq("user_id", userId);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error: any) {
      console.error("Error fetching achievements:", error.message);
    }
  };

  return (
    <div className="base-container stagger-XR">
      <h3 className="text-xl font-bold text-gray-100 mb-5 flex items-center gap-2">
        <GiMuscleUp className="w-7 h-7 text-gold-400" />
        Gym Achievements Feed
      </h3>

      {/* TODO: Add acheivement information here once we figure out what it is - COMPLETED
          Created a new database for gym acheivements, as well as user achievements.
          The following code pulls from the user_achievements database to display the achievements earned by the user.
          The user_achievement database has a foriegn key that references the achievements database to display the achievement description and the associated icon. */}

      <div className="my-1 max-h-64 min-h-64 overflow-y-auto space-y-4">
        {achievements.filter(a => a.achievement_status === showAchievementStatus).length === 0 ? (
          <div className="text-gray-400 text-center py-6">No achievements yet.</div>
        ) : (
          achievements
            .filter(a => a.achievement_status === showAchievementStatus)
            .map((item, index) => {
              const Icon = (Icons as any)[item.achievements.icon];
              return (
                <div
                  key={index}
                  className="w-full flex justify-center flex-col items-center gap-3 p-3 items-list rounded-lg"
                >
                  <Icon className="w-8 h-8 text-gold-400" />
                  <div className="bg-gray-600 border-4 border-gray-900 rounded-full p-3 w-full text-center">
                    <span className="text-md text-gold-400">{item.achievements.description}</span>
                  </div>
                </div>
              );
            })
        )}
      </div>
      <button
        onClick={() => setShowAchievementStatus(prev => prev === "achieved" ? "in_progress" : "achieved")}
        className="button-icon bg-gold-500/90 hover:bg-gold-500"
      >
        <GiWeightScale className="w-7 h-7" />
        <span>{showAchievementStatus === "achieved" ? "View In Progress" : "View Achieved"}</span>
      </button>
    </div>
  );
};
