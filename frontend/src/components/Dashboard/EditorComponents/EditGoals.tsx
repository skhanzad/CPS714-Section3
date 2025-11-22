import { useState, useEffect } from 'react';
import { Save, Edit2, X } from 'lucide-react';
import { GiMuscleUp } from 'react-icons/gi';
import { Database } from '../../../lib/supabase';
import { submitProfile } from './submitProfile';

// Re-using the same type definition from MemberDashboard for consistency
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
    // membership_subscriptions comes back as an array when using a relation select
    membership_subscriptions: (Database['public']['Tables']['membership_subscriptions']['Row'] & {
        membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
    })[] | null;
};

interface EditGoalsProps {
    profile: ProfileWithSubscription | null;
    returnProfileData: (profile: ProfileWithSubscription | null) => void;
    reportSuccessGoals: () => void;
    reportErrorInGoalsEdit: (message: string) => void;
}

export const EditGoals = ({ profile, returnProfileData, reportSuccessGoals, reportErrorInGoalsEdit }: EditGoalsProps) => {
    const userId = profile?.id;

    const [fitnessGoals, setFitnessGoals] = useState('');
    const [save, setSaving] = useState(false);
    const [isEditingGoals, setIsEditingGoals] = useState(false);

    useEffect(() => {
        // Load initial data from the profile
        setFitnessGoals(profile?.fitness_goals || '');
    }, [profile]);

    /* same logic as above but for fitness goals */
    const handleEditGoals = () => {
        setIsEditingGoals(true);
    };

    const handleCancelGoals = () => {
        setIsEditingGoals(false);
        setFitnessGoals(profile?.fitness_goals || '');
    };

    const handleSubmitButton = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId || !profile) {
            reportErrorInGoalsEdit("Cannot update profile: User ID is missing.");
            return;
        }

        setSaving(true);

        try {
            const updatedProfile = await submitProfile({
                userId,
                updates: { fitness_goals: fitnessGoals },
                currentProfile: profile,
            });

            returnProfileData(updatedProfile);
            setIsEditingGoals(false);
            reportSuccessGoals();
        } catch (err: any) {
            reportErrorInGoalsEdit("Error Updating Profile: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative bg-gray-800/60 border border-gray-700/50 hover:border-gold-500/30 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-gold-500/5 stagger-2">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
            />
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <GiMuscleUp className="w-6 h-6 text-gold-400" />
                    Fitness Goals
                </h3>
                {!isEditingGoals ? (
                    <button
                        onClick={handleEditGoals}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-gold-400 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancelGoals}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-red-400 rounded-lg font-medium transition-all duration-300 text-sm"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitButton}
                            disabled={save}
                            className="flex items-center gap-2 px-4 py-2 bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-lg font-medium transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {save ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                )}
            </div>

            {/* Update fitness goals */}
            <textarea
                value={fitnessGoals}
                onChange={(e) => setFitnessGoals(e.target.value)}
                className="input-field min-h-[160px] resize-none w-full relative z-10"
                placeholder="What are your fitness goals?"
                disabled={!isEditingGoals}
            />
        </div>
    );
};
