import { useState } from 'react';
import { supabaseN } from '../../lib/supabaseNot';

// simple modal for staff to send a notification to users
export default function NotificationSend({ onClose }: { onClose?: () => void }) {
  // form state: these hold the form values
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  // default author is 'Staff' so notifications show who sent them
  const [author, setAuthor] = useState('Staff');
  const [memberCat, setMemberCat] = useState('all');
  const [endTime, setEndTime] = useState('');

  // loading flag for submit button
  const [loading, setLoading] = useState(false);

  // recipients array holds email strings we fetched from the DB
  // empty array means no recipients found yet
  const [recipients, setRecipients] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    // stop page reload
    e.preventDefault();
    // show loading state on button
    setLoading(true);
    try {
      // build the data we will save to the notifications table
      const payload: any = {
        title,
        body,
        author: author || null,
        member_cat: memberCat || null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
      };

      const { error } = await supabaseN.from('notifications').insert([payload]);
      if (error) throw error;

      // After inserting the notification, fetch recipient emails from the
      // public view `users_emails` (created in Supabase SQL editor).
      try {
        const { data: users, error: usersError } = await supabaseN
          .from('users_emails')
          .select('email')
          .not('email', 'is', null);

        if (usersError) {
          // show error in console so dev can see what went wrong
          console.error('Error fetching emails view:', usersError);
        } else {
          // make a array of emails
          const emails = (users as any[]).map((u) => u.email).filter(Boolean);
          console.debug('Fetched recipient emails from view:', emails);
          const emailsT = ['harjap.saini@torontomu.ca']
          setRecipients(emailsT);
          if (emails.length > 0) {
            // send emails using backend proxy endpoint
            const postmarkUrl = import.meta.env.VITE_POSTMARK_PROXY_URL || 'http://localhost:8000/data/send_postmark';
            try {
              const resp = await fetch(postmarkUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title || 'Notification', body, recipients: emailsT }),
              });

              if (!resp.ok) {
                let info = '';
                try { info = await resp.text(); } catch {}
                //log and alert incase of error
                console.error('Postmark send failed:', resp.status, info);
                alert('Notification saved but email send failed. See console for details.');
              }
            } catch (fetchErr: any) {
              // network error when calling our backend
              console.error('Error calling Postmark endpoint:', fetchErr);
              alert('Notification saved but email could not be sent (network error).');
            }
          }
        }
      } catch (e) {
        console.error('Error querying users for recipient emails:', e);
        setRecipients([]);
      }

      // small visual confirmation
      // This file shows a modal that staff can use to send notifications.
      alert('Notification sent');
      setTitle('');
      setBody('');
      onClose && onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => onClose && onClose()}>
      <div className="w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Send Notification</h3>
            <button
              onClick={() => onClose && onClose()}
              className="text-gray-400 hover:text-white rounded-md p-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm text-gray-300 mb-1">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-300 mb-1">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder:text-slate-400 h-28"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Author</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Membership Type</label>
                <input
                  value={memberCat}
                  onChange={(e) => setMemberCat(e.target.value)}
                  placeholder="all, basic, premium, staff"
                  className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">End Time (optional)</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose && onClose()}
                className="px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-700/90"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md bg-gold-500 text-gray-900 font-semibold hover:brightness-95 disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
            {import.meta.env.DEV && recipients !== null && (
              <div className="mb-3 text-sm text-gray-300">
                <div>Recipients found: <strong className="text-white">{recipients.length}</strong></div>
                <div className="mt-1 max-h-32 overflow-auto bg-gray-800 border border-gray-700 p-2 rounded text-xs">
                  {recipients.length > 0 ? (
                    recipients.map((r) => (
                      <div key={r} className="text-slate-300">{r}</div>
                    ))
                  ) : (
                    <div className="text-slate-500">(no recipients)</div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
