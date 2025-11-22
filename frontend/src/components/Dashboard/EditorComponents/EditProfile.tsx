/**
 * Edit Profile Component for User Profile:
 * This component allows users to view and edit their personal information, including profile picture, name, email, and phone number.
 * It handles form submission to update the user's profile and communicates updates back to the parent component (ProfileEditor) through 
 * callback functions after awaiting a response from the submitProfile function.
 * 
 * The component receives the following props:
 * - profile: An object containing the user's profile information along with their membership subscription details.
 * - returnProfileData: A function to return the updated profile data to the parent component after edits.
 * - reportSuccessProfile: A function to notify the parent component of a successful profile update.
 * - reportErrorInProfileEdit: A function to notify the parent component of any errors during the profile update process.
 * 
 * The component manages its own state for the profile fields, editing mode, and saving status using React's useState hook.
 * It also uses useEffect to initialize the profile fields from the profile prop when the component mounts or when the profile changes.
 * 
 * @param {ProfileWithSubscription | null} profile - The user's profile data including membership subscription details and fitness goals.
 * @param {ProfileWithSubscription | null} returnProfileData - Callback function to return updated profile data to the parent component.
 * @param reportSuccessProfile - Callback function to notify parent component of successful profile update.
 * @param {string} reportErrorInProfileEdit - Callback function to notify parent component of errors during profile update.
 * 
 * @returns A JSX element representing the Edit Goals interface.
 */

import { useState, useEffect } from 'react';
import { Save, User, Upload, Edit2, X } from 'lucide-react';
import { Database } from '../../../lib/supabase';
import { submitProfile } from './submitProfile';

// Re-using the same type definition from MemberDashboard for consistency
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
    // membership_subscriptions comes back as an array when using a relation select
    membership_subscriptions: (Database['public']['Tables']['membership_subscriptions']['Row'] & {
        membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
    })[] | null;
};

interface EditProfileProps {
    profile: ProfileWithSubscription | null;
    returnProfileData: (profile: ProfileWithSubscription | null) => void;
    reportSuccessProfile: () => void;
    reportErrorInProfileEdit: (message: string) => void;
}

export const EditProfile = ({ profile, returnProfileData, reportSuccessProfile, reportErrorInProfileEdit }: EditProfileProps) => {
    const userId = profile?.id;

    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePicture, setProfilePicture] = useState<string>('');
    const [save, setSaving] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        // Load initial data from the profile
        const nameParts = (profile?.full_name || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        // @ts-ignore
        setEmail(profile?.email || '');
        // @ts-ignore
        setPhoneNumber(profile?.phone_number || '');
        setProfilePicture(profile?.profile_picture_url || '');
    }, [profile]);

    /* if the user hits the edit button enable the fields in the form */
    const handleEditProfile = () => {
        setIsEditingProfile(true);
    };

    /* if the user hits the cancel button it should reset the form*/
    const handleCancelProfile = () => {
        setIsEditingProfile(false);

        /* If the user hits cancel we reset the form to the original data */
        const nameParts = (profile?.full_name || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        // @ts-ignore
        setPhoneNumber(profile?.phone_number || '');
        setProfilePicture(profile?.profile_picture_url || '');
    };

    const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        /* Make sure the sure selects a file */
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            /* Use a FileReader to convert the image to string */
            const reader = new FileReader();

            /* Once the file is read, set the profile picture (as a string to be able to store in a database) */
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitButton = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId || !profile) {
            reportErrorInProfileEdit("Cannot update profile: User ID is missing.");
            return;
        }

        setSaving(true);

        try {
            if (invalidEmailFormat(email)) throw new Error('Invalid email format');
            if (invalidPhoneNumberFormat(phoneNumber)) throw new Error('Invalid phone number format');

            const fullName = `${firstName} ${lastName}`.trim();

            const updatedProfile = await submitProfile({
                userId,
                updates: {
                    full_name: fullName,
                    phone_number: forcePhoneNumberFormat(phoneNumber),
                    email: email,
                    profile_picture_url: profilePicture,
                },
                currentProfile: profile,
            });

            returnProfileData(updatedProfile);
            setIsEditingProfile(false);
            reportSuccessProfile();
        } catch (err: any) {
            reportErrorInProfileEdit("Error Updating Profile: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    function forcePhoneNumberFormat(number: string): string {
        /* Remove all non-digit characters */
        const digits = number.replace(/\D/g, '');
        return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;

    }

    /* Returns true if the email is invalid */
    function invalidEmailFormat(email: string): boolean {
        if (email.length === 0) return true;
        else if (!email.includes('@') || !email.includes('.') || email.indexOf('@') > email.lastIndexOf('.') || email.startsWith('@') || email.endsWith('.') || email.endsWith('@') || email.endsWith('.')) return true;
        else return false;
    }

    function invalidPhoneNumberFormat(number: string): boolean {
        const digits = number.replace(/\D/g, '');
        return digits.length !== 10;
    }

    return (
        <div className="relative my-1 h-full base-container stagger-1">
            {/* Background Image */}
            <div
                className="backgroun-image"
                style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1592051610978-672b8b817647?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            }}/>

            <div className="relative z-10 flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <User className="w-6 h-6 text-gold-400" />
                    Personal Information
                </h3>
                {!isEditingProfile ? (
                    <button
                        onClick={handleEditProfile}
                        className="flex items-center gap-2 p-button general-button-hover rounded-lg font-medium text-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancelProfile}
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

            <div className="relative z-10 grid items-center gap-4 mb-6 border border-gold-400/50 p-4 rounded-lg">
                {/* Profile Picture at Top */}
                <div className="flex items-center gap-4 m-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-700/50 hover:border-gold-500/50 transition-all duration-300">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Profile"
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {isEditingProfile && (
                        <div>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePictureUpload}
                                    className="hidden"
                                />
                                <div className="inline-flex items-center gap-2 p-button general-button-hover rounded-lg font-medium border border-gray-600/50 hover:border-gold-500/50 text-xs">
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Photo</span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                {/* Form for profile information */}
                <form onSubmit={handleSubmitButton} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {/* Update first name */}
                            <label className="block text-sm font-semibold text-gold-400 mb-2 uppercase tracking-wide">First Name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="input-field items-list"
                                disabled={!isEditingProfile}
                                required
                            />
                        </div>
                        <div>
                            {/* Update last name */}
                            <label className="block text-sm font-semibold text-gold-400 mb-2 uppercase tracking-wide">Last Name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="input-field items-list"
                                disabled={!isEditingProfile}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        {/* Update email name */}
                        <label className="block text-sm font-semibold text-gold-400 mb-2 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field items-list"
                            disabled={!isEditingProfile}
                            required
                        />
                    </div>

                    <div>
                        {/* Update phone number (not actually sure if phone number is needed but added anyways) */}
                        <label className="block text-sm font-semibold text-gold-400 mb-2 uppercase tracking-wide">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="input-field items-list"
                            placeholder="(123) 456-7890"
                            disabled={!isEditingProfile}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};
