import { Crown } from 'lucide-react';
import { Database } from '../../../lib/supabase';

type Subscription = Database['public']['Tables']['membership_subscriptions']['Row'] & {
    membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
};

interface MembershipBannerProps {
    subscription: Subscription | null | undefined;
    sendToProfile: () => void;
}

export const MembershipBanner = ({ subscription, sendToProfile }: MembershipBannerProps) => {
    const tier = subscription?.membership_tiers;

    return (
        <div className="relative rounded-2xl border border-gold-500/30 p-6 overflow-hidden hover:border-gold-500/30 hover:shadow-xl hover:shadow-gold-500/5 h-28">
            {/* Background Image For Membership Status */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&q=80')",
                }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/60 to-gold-600/60" />

            {/* Basic Membership Status Info */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Added a crown button that also sends you to the users profile page to see more info on membership */}
                    <button
                        onClick={sendToProfile}
                        className="bg-gold-500/90 p-3 rounded-xl shadow-lg hover:bg-gold-500 transition-all duration-300 hover:scale-110 cursor-pointer"
                        title="Membership Details"
                    >
                        <Crown className="w-8 h-8 text-gray-900" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white drop-shadow-lg">{tier?.name || 'No Active Plan'}</h2>
                        <p className="text-gray-100 text-sm mt-1 drop-shadow">
                            {subscription?.status ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
                                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                </span>
                            ) : (
                                'Inactive'
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-100 text-lg font-semibold drop-shadow">
                        {subscription?.renewal_date
                            ? `Renewal Date: ${subscription.renewal_date.split('T')[0]}`
                            : 'No renewal date'}
                    </p>
                </div>
            </div>
        </div>
    );
};