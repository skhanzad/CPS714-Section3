import { Crown } from 'lucide-react';
import { Database } from '../../../lib/supabase';

type Subscription = Database['public']['Tables']['membership_subscriptions']['Row'] & {
    membership_tiers: Database['public']['Tables']['membership_tiers']['Row'] | null;
};

interface MembershipDetailsProps {
    subscription: Subscription | null | undefined;
    /* Add the prop for billing details here */
}

export const MembershipDetails = ({ subscription }: MembershipDetailsProps) => {
    const tier = subscription?.membership_tiers;

    return (

        <div className="bg-gray-800/60 border border-gray-700/50 hover:border-gold-500/30 transition-all duration-300 p-6 hover:shadow-xl hover:shadow-gold-500/5 stagger-1 h-full flex flex-col">
            {/* Combined Membership Details & Upgrade Section */}
            <div
                className="bg-gold-500/90 p-3 rounded-xl shadow-lg hover:bg-gold-500 transition-all cursor-pointer h-14 w-auto flex items-center gap-3"
                title="Membership Details">
                <Crown className="w-6 h-6 text-gray-900" />
                <span className="text-xl font-bold text-gray-900">Membership Details</span>
            </div>
            {tier && subscription ? (
                <div className="space-y-4 mt-6 text-sm flex-grow">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-400 uppercase tracking-wider">Tier</span>
                        <span className="font-bold text-gold-400 text-base">{tier.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                        <span className="font-medium text-gray-100 capitalize bg-green-500/20 px-2 py-1 rounded-md">{subscription.status}</span>
                    </div>
                    {subscription.renewal_date && (
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-400 uppercase tracking-wider">Next Renewal</span>
                            <span className="font-medium text-gray-100">
                                {subscription.renewal_date.split('T')[0]}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-400">No active membership found.</p>
                </div>
            )}

            {/* Button that should send you to billing details */}
            <button
                className="mt-6 px-4 py-2 bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-lg font-medium transition-all duration-300 text-sm w-full"
            >
                Upgrade Membership & View Billing Details
            </button>
        </div>
    );
};