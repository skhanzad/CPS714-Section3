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
        <div className="bg-gray-800/60 border border-gray-700/50 hover:border-gold-500/30 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-gold-500/5 stagger-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <User className="w-6 h-6 text-gold-400" />
                    Personal Information
                </h3>
                {!isEditingProfile ? (
                    <button
                        onClick={handleEditProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-gold-400 rounded-lg font-medium transition-all duration-300 text-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCancelProfile}
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

            {/* Profile Picture at Top */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-700/50 hover:border-gold-500/50 transition-all duration-300 shadow-lg">
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center">
                                <User className="w-10 h-10 text-gray-500" />
                            </div>
                        )}
                    </div>
                </div>

                {isEditingProfile && (
                    <div className="flex-1">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePictureUpload}
                                className="hidden"
                            />
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-gold-400 rounded-lg font-medium transition-all duration-300 border border-gray-600/50 hover:border-gold-500/50 text-xs">
                                <Upload className="w-3.5 h-3.5" />
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
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="input-field"
                            disabled={!isEditingProfile}
                            required
                        />
                    </div>
                    <div>
                        {/* Update last name */}
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="input-field"
                            disabled={!isEditingProfile}
                            required
                        />
                    </div>
                </div>

                <div>
                    {/* Update email name */}
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        disabled={!isEditingProfile}
                        required
                    />
                </div>

                <div>
                    {/* Update phone number (not actually sure if phone number is needed but added anyways) */}
                    <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="input-field"
                        placeholder="(123) 456-7890"
                        disabled={!isEditingProfile}
                    />
                </div>
            </form>
        </div>
    );
};
