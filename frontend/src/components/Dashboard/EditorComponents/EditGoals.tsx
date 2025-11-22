/**
 * Edit Goals Component for User Profile:
 * This component allows users to view and edit their fitness goals, and handles form submission to update the user's profile with new goals.
 * All updates are communicated back to the parent component (ProfileEditor) through callback functions after awaiting a response from the submitProfile function.
 * 
 * The component receives the following props:
 * - profile: An object containing the user's profile information along with their membership subscription details.
 * - returnProfileData: A function to return the updated profile data to the parent component after edits.
 * - reportSuccessGoals: A function to notify the parent component of a successful goals update.
 * - reportErrorInGoalsEdit: A function to notify the parent component of any errors during the goals update process.
 * 
 * The component manages its own state for the fitness goals text area, editing mode, and saving status using React's useState hook.
 * It also uses useEffect to initialize the fitness goals from the profile prop when the component mounts or when the profile changes.
 * 
 * @param {ProfileWithSubscription | null} profile - The user's profile data including membership subscription details and fitness goals.
 * @param {ProfileWithSubscription | null} returnProfileData - Callback function to return updated profile data to the parent component.
 * @param reportSuccessGoals - Callback function to notify parent component of successful goals update.
 * @param {string} reportErrorInGoalsEdit - Callback function to notify parent component of errors during goals update.
 * 
 * @returns A JSX element representing the Edit Goals interface.
 */

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
        <div className="relative base-container stagger-2">
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
                        className="flex items-center gap-2 p-button general-button-hover rounded-lg font-medium text-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancelGoals}
                            className="flex items-center gap-2 p-button general-button-hover rounded-lg font-medium text-sm"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitButton}
                            disabled={save}
                            className="flex items-center gap-2 p-button bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-lg font-medium transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="input-field min-h-[160px] resize-none w-full relative z-10 items-list"
                placeholder="What are your fitness goals?"
                disabled={!isEditingGoals}
            />
        </div>
    );
};
