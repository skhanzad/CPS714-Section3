import React from 'react';
import SignupsCancellationsChart from './components/signups_cancellations_chart';
import MostPopularChart from './components/most_popular_chart';
import MostBusyTimesChart from './components/most_busy_chart';
import GymUsageChartv2 from './components/hourly_gym_usage_chartv2';
import MembershipChartv2 from './components/membership_chartv2';
import DaysHoursChart from './components/days_hours_chart';
import ActiveMembers from './components/active_members';
import MemberTypesChart from './components/member_types_chart';
import Card from './components/Card';

export const Analytics: React.FC = () => {
    return (
        <div className="w-full p-14 pt-8 bg-slate-800 text-slate-100 rounded-lg border-2 border-[#ca8a04]">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-amber-300">Reporting & Analytics</h1>
                    <div className="text-sm text-slate-300">Membership signups, popular classes, and gym activity</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <SignupsCancellationsChart />
                        </Card>

                    </div>

                    <div className="space-y-6">
                        <Card>
                            <ActiveMembers />
                        </Card>

                        <Card>
                            <MemberTypesChart />
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <MembershipChartv2 />
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <MostPopularChart />
                    </Card>
                    <Card>
                        <MostBusyTimesChart />
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <DaysHoursChart />
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Card>
                        <GymUsageChartv2 />
                    </Card>
                </div>
            </div>
        </div>
        
    );
};

export default Analytics;