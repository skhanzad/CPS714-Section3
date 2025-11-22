import { useState } from 'react';
import { X, Crown, Save } from 'lucide-react';
import { Database } from '../../lib/supabase';
import { EditProfile } from './EditorComponents/EditProfile';
import { EditGoals } from './EditorComponents/EditGoals';
import { MembershipDetails } from './EditorComponents/MembershipDetails';

// Re-using the same type definition from MemberDashboard for consistency
type ProfileWithSubscription = Database['public']['Tables']['profiles']['Row'] & {
  // membership_subscriptions comes back as an array when using a relation select
  membership_subscriptions: (Database['public']['Tables']['membership_subscriptions']['Row'] & {
    membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
  })[] | null;
};

interface ProfileEditorProps {
  profile: ProfileWithSubscription | null;
  returnProfileData: (profile: ProfileWithSubscription | null) => void;
}

export const ProfileEditor = ({ profile, returnProfileData }: ProfileEditorProps) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(''), 2000);
  };

  const subscription = profile?.membership_subscriptions?.[0];

  return (
    <div className="space-y-6">
      {/* TODO: I feel like this should also be its own component */}
      {/* Success Message If User Updates Info Correctly */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg animate-scale-in">
          <X className="w-6 h-6" />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-gold-500/20 border border-gold-500 text-gold-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg animate-scale-in">
          <Save className="w-6 h-6" />
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

      {/* Same Widget From Dashboard But With Buttons and INFO removed */}
      <div className="relative rounded-2xl border border-gold-500/30 p-6 overflow-hidden hover:border-gold-500/30 hover:shadow-xl hover:shadow-gold-500/5 h-28">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&q=80')",
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/60 to-gold-600/60 z-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Profile Picture & Personal Information Section */}
        <EditProfile profile={profile} returnProfileData={returnProfileData} reportSuccessProfile={handleSuccess} reportErrorInProfileEdit={handleError} />
        <MembershipDetails subscription={subscription} />
      </div>

      {/* Fitness Goals Widget */}
      <EditGoals profile={profile} returnProfileData={returnProfileData} reportSuccessGoals={handleSuccess} reportErrorInGoalsEdit={handleError}
      />
    </div>
  );
};
