import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, MessageCircle, Send, TrendingUp, Award, Calendar } from 'lucide-react';

export const SocialFeed = () => {
  const { user, profile } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
    const subscription = supabase
      .channel('activity_feed_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_feed' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase
      .from('activity_feed')
      .select('*, profiles(full_name, profile_picture_url)')
      .order('created_at', { ascending: false })
      .limit(20);

    setActivities(data || []);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('activity_feed').insert({
        user_id: user?.id,
        activity_type: 'post',
        content: newPost,
      });

      if (error) throw error;

      setNewPost('');
      fetchActivities();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'milestone':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-amber-50 border-amber-200';
      case 'milestone':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Community Feed</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={handlePost} className="space-y-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Share your workout achievement or encourage others..."
          />
          <button
            type="submit"
            disabled={loading || !newPost.trim()}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Post Update
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No activity yet. Be the first to post!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`rounded-xl p-6 shadow-sm border ${getActivityColor(activity.activity_type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                  {activity.profiles.full_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900">{activity.profiles.full_name}</span>
                    {getActivityIcon(activity.activity_type)}
                    <span className="text-sm text-slate-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{activity.content}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
