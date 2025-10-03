import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trophy, TrendingUp, Calendar, Target, Users, Award } from 'lucide-react';

export const CommunityChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (data) {
      setChallenges(data);
      data.forEach((challenge) => {
        fetchLeaderboard(challenge.id);
      });
    }
  };

  const fetchLeaderboard = async (challengeId: string) => {
    const { data } = await supabase
      .from('challenge_participants')
      .select('*, profiles(full_name)')
      .eq('challenge_id', challengeId)
      .order('current_progress', { ascending: false })
      .limit(10);

    setLeaderboards((prev) => ({ ...prev, [challengeId]: data || [] }));
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase.from('challenge_participants').insert({
        challenge_id: challengeId,
        user_id: user?.id,
        current_progress: 0,
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Challenge Joined',
        message: "You've joined a new challenge! Good luck!",
        type: 'success',
      });

      fetchChallenges();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isParticipating = (challengeId: string) => {
    return leaderboards[challengeId]?.some((p) => p.user_id === user?.id);
  };

  const getChallengeStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', color: 'bg-slate-100 text-slate-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'class_count':
        return 'Most Classes Attended';
      case 'total_workouts':
        return 'Total Workouts';
      default:
        return 'Custom Challenge';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-600" />
          Community Challenges
        </h2>
      </div>

      {challenges.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No active challenges at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {challenges.map((challenge) => {
            const status = getChallengeStatus(challenge.start_date, challenge.end_date);
            const participating = isParticipating(challenge.id);
            const leaderboard = leaderboards[challenge.id] || [];

            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{challenge.title}</h3>
                      <p className="text-blue-100">{challenge.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-blue-200 mb-1">
                        <Target className="w-4 h-4" />
                        Type
                      </div>
                      <div className="font-semibold">{getChallengeTypeLabel(challenge.challenge_type)}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-blue-200 mb-1">
                        <Calendar className="w-4 h-4" />
                        Duration
                      </div>
                      <div className="font-semibold">
                        {new Date(challenge.start_date).toLocaleDateString()} -{' '}
                        {new Date(challenge.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-blue-200 mb-1">
                        <Users className="w-4 h-4" />
                        Participants
                      </div>
                      <div className="font-semibold">{leaderboard.length}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {!participating && status.label === 'Active' && (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
                    >
                      Join Challenge
                    </button>
                  )}

                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Leaderboard
                  </h4>

                  {leaderboard.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No participants yet. Be the first!</p>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((participant, index) => (
                        <div
                          key={participant.id}
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            participant.user_id === user?.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0
                                  ? 'bg-amber-500 text-white'
                                  : index === 1
                                  ? 'bg-slate-300 text-slate-700'
                                  : index === 2
                                  ? 'bg-orange-400 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {participant.profiles.full_name}
                                {participant.user_id === user?.id && (
                                  <span className="ml-2 text-blue-600 text-sm">(You)</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">{participant.current_progress}</p>
                            <p className="text-xs text-slate-500">
                              {challenge.target_value > 0
                                ? `/ ${challenge.target_value} goal`
                                : 'progress'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
