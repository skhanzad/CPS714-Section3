import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, User, Phone, Target, Award } from 'lucide-react';

export const ProfileEditor = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmergencyContact(profile.emergency_contact || '');
      setFitnessGoals(profile.fitness_goals || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          emergency_contact: emergencyContact,
          fitness_goals: fitnessGoals,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const subscription = profile?.membership_subscriptions?.[0];
  const tier = subscription?.membership_tiers;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Award className="w-5 h-5" />
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Emergency Contact
                </span>
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name and phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Fitness Goals
                </span>
              </label>
              <textarea
                value={fitnessGoals}
                onChange={(e) => setFitnessGoals(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="What are your fitness goals?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Membership Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Email</span>
                <span className="font-medium text-slate-900">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Member Since</span>
                <span className="font-medium text-slate-900">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Current Plan</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded">
                  {tier?.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Billing Cycle</span>
                <span className="font-medium text-slate-900 capitalize">{subscription?.billing_cycle}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Next Billing Date</span>
                <span className="font-medium text-slate-900">
                  {subscription?.renewal_date
                    ? new Date(subscription.renewal_date).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Upgrade Your Membership</h3>
            <p className="text-slate-600 text-sm mb-4">
              Get access to premium classes and unlimited bookings
            </p>
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition">
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
