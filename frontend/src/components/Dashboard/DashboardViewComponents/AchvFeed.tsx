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
 * The component uses the useEffect hook to fetch achievement data from Supabase when the component mounts
 * or when the userId prop changes.
 */

import { useState, useEffect } from 'react';
import * as Icons from "react-icons/gi";
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      setLoading(false);
    };

    if (userId) fetchAchievements();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-gray-800/60 border border-gray-700/50 p-6 text-gray-200 text-center">
        Loading achievements...
      </div>
    );
  }

  return (
    <div className="bg-gray-800/90 border border-gray-700/50 hover:border-gold-500/30 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-gold-500/5 hover:-translate-y-1 stagger-1">
      <h3 className="text-xl font-bold text-gray-100 mb-5 flex items-center gap-2">
        <GiMuscleUp className="w-7 h-7 text-gold-400" />
          Gym Achievements Feed
      </h3>
                  
      <div className="space-y-4">
                    
        {/* TODO: Add acheivement information here once we figure out what it is - COMPLETED
          Created a new database for gym acheivements, as well as user achievements.
          The following code pulls from the user_achievements database to display the achievements earned by the user.
          The user_achievement database has a foriegn key that references the achievements database to display the achievement description and the associated icon. */}

        <div className="text-center text-gray-400">                     
          <div className="flex flex-col gap-5 max-h-64 min-h-64 overflow-y-auto">
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
                    className="w-full flex flex-col items-center text-center gap-3 p-2 border border-gray-700 rounded-lg bg-gray-700/30 hover:bg-gray-700 hover:border-gold-400 transition-all duration-200"
                  >
                    <Icon className="w-10 h-10 text-gold-400" />
                    <span className="text-lg text-gray-200">{item.achievements.description}</span>
                  </div>
                );
                })
              )}
          </div>   
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-800 flex justify-center">
          <button
            onClick={() => setShowAchievementStatus(prev => prev === "achieved" ? "in_progress" : "achieved")}
            className="w-full px-6 py-4 bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg"
          >
            <GiWeightLiftingUp className="w-7 h-7 group-hover:scale-110 transition-transform duration-300"/>
            <span>{showAchievementStatus === "achieved" ? "View In Progress" : "View Achieved"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
