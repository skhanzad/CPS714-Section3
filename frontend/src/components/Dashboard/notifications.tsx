import React, { useEffect, useState } from 'react';
import { supabaseN, DatabaseN } from '../../lib/supabaseNot';

// Notifications view integrated with project supabase client and dark theme styles
export default function Notifications() {
  // `items` will hold notification rows fetched from the DB
  const [items, setItems] = useState<DatabaseN['public']['Tables']['notifications']['Row'][]>([]);
  // `loading` shows a small loading text while we fetch data
  const [loading, setLoading] = useState(true);

  // load notifications once when component mounts
  useEffect(() => {
    const load = async () => {
      try {
        // Only fetch notifications that are active: end_time IS NULL OR end_time > now
        const now = new Date().toISOString();
        const filter = `end_time.is.null,end_time.gt.${now}`;
        const { data, error } = await supabaseN
          .from('notifications')
          .select('*')
          .or(filter)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          // log error and show empty list
          console.error('Failed to load notifications', error);
          setItems([]);
        } else {
          // save fetched rows into state
          setItems((data as any[]) || []);
        }
      } catch (err) {
        // unexpected error
        console.error('Error loading notifications', err);
        setItems([]);
      } finally {
        // hide loading indicator
        setLoading(false);
      }
    };

    load();
  }, []);

  // while loading show a small message
  if (loading) return <div className="p-4 text-gray-300">Loading notifications...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-white">Notifications</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-slate-400">No notifications</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((n) => (
            <div key={n.id} className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <p className="text-sm text-slate-300 mt-1">{n.body}</p>
                </div>
                <div className="text-xs text-slate-400 ml-4 whitespace-nowrap">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
              </div>
              {/* show author if present */}
              {n.author && <div className="text-xs text-slate-500 mt-2">Posted by {n.author}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
