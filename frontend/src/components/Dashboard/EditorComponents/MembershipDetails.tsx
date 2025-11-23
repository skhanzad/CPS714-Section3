/**
 * Membership Details Component for User Profile:
 * Displays the user's current membership tier, status, and renewal date.
 * Also includes a button to upgrade membership and view billing details, however the button does not currently have functionality.
 * 
 * The component receives the following props:
 * - subscription: An object containing the user's membership subscription details along with their membership tier information.
 * 
 * This component is designed to provide users with an overview of their membership status.
 * 
 * @param {Subscription | null | undefined} subscription - The user's membership subscription details including membership tier information.
 * 
 * @returns A JSX element representing the Membership Details interface.
 */

import { CalendarCheck, Circle, Crown, MedalIcon, User } from 'lucide-react';
import { Database } from '../../../lib/supabase';
import { BsCash } from 'react-icons/bs';
import { GiCheckMark } from 'react-icons/gi';
import { ImCheckmark2 } from 'react-icons/im';

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

        <div className="relative my-1 base-container stagger-XR h-full flex flex-col">
            {/* Background Image */}
            <div
                className="backgroun-image"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1730652128205-f5e98e542786?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }} />
            {/* Combined Membership Details & Upgrade Section */}
            <div
                className="bg-gold-500 p-3 rounded-xl shadow-lg hover:bg-gold-500 transition-all h-14 w-auto flex justify-center items-center gap-3"
                title="Membership Details">
                <Crown className="w-6 h-6 text-gray-900" />
                <span className="text-xl font-bold text-gray-900">Membership Details</span>
            </div>
            {tier && subscription ? (
                <div className="relative z-10 space-y-2 my-6 text-sm flex-grow divide-y divide-gold-500">
                    <div className="flex justify-between items-center px-3 pt-6">
                        <span className="text-gray-300 uppercase tracking-wider flex gap-3 text-lg"><User className="w-6 h-6 text-gray-300" />Status:</span>
                        <span className="font-semibold text-gray-900/50 capitalize bg-gold-500 px-3 rounded-lg text-lg animate-pulse flex items-center"><GiCheckMark className="w-5 h-5 text-green-500" />{subscription.status}</span>
                    </div>
                    <div className="flex justify-between items-center p-3">
                        <span className="text-gray-300 uppercase tracking-wider flex gap-3 text-lg"><MedalIcon className="w-6 h-6 text-gray-300" />Tier:</span>
                        <span className="text-gold-400 text-lg font-semibold">{tier.name}</span>
                    </div>
                    {subscription.renewal_date && (
                        <div className="flex justify-between items-center p-3">
                            <span className="text-gray-300 uppercase tracking-wider flex gap-3 text-lg"><CalendarCheck className="w-6 h-6 text-gray-300" />Next Renewal:</span>
                            <span className="font-semibold text-gray-300 text-lg">
                                {subscription.renewal_date.split('T')[0]}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <p className="text-gray-300">No active membership found.</p>
                </div>
            )}

            {/* Button that should send you to billing details */}
            <button
                className="relative z-10 p-button button-icon bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-lg"
            >
                <BsCash className="w-6 h-6" />
                <span>Upgrade Membership & View Billing Details</span>
            </button>
        </div>
    );
};