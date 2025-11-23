"use client";

import { useState } from "react";
import { admin_supabase } from './supabaseClient'; // updated import

const CreateChallengePage = ({ onClose, refreshClasses }: { onClose: () => void, refreshClasses: () => void }) => {
  const [challengeData, setChallengeData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    reward: '',
  });
 // Loading, success, and error states for form submission
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
  if (!challengeData.title.trim() ) {
    return "Challenge title is required.";
  }
  if (!challengeData.description.trim()) {
    return "Description is required.";
  }
  if (!challengeData.start_date) {
    return "Start date is required.";
  }
  if (!challengeData.end_date) {
    return "End date is required.";
  }
  if (challengeData.end_date < challengeData.start_date) {
    return "End date cannot be earlier than start date.";
  }
  if (!challengeData.reward.trim()) {
    return "Reward is required.";
  }

  return null; // no errors
};

  // Handle form submission upon clicking "Create Challenge" button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
   
  // check for missing/invalid fields
  const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
  }
    // Insert values into Supabase table
    const { error } = await admin_supabase.from("challenges").insert([
    {
    title: challengeData.title.trim(),
    description: challengeData.description.trim(),
    start_date: challengeData.start_date,
    end_date: challengeData.end_date,
    reward: challengeData.reward.trim(),
    },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      refreshClasses();
      setChallengeData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        reward: '',
      });
    }
    setLoading(false);
  };
  return (
    // Modal overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-10 z-50 overflow-y-auto">  
      <div className="relative w-full max-w-3xl mx-4 my-10 text-white bg-[#0A1128] rounded-2xl shadow-2xl border border-white/10 overflow-hidden px-6 py-16">
        {/* Page Header */}
        <div
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-[#D4AF37] drop-shadow-lg">
            Create a New Challenge
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Gym staff can design custom fitness challenges for members to
            participate in. Fill out the details below and launch your next
            challenge.
          </p>
        </div>

        {/* Challenge Form */}
        <div
          className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10"
        >
          <form className="space-y-6" onSubmit={handleSubmit}> {/* added onSubmit handler for Create Challenges button*/}
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                Challenge Title
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-black/40 border border-gray-600 text-white focus:border-[#D4AF37] outline-none"
                placeholder="e.g. Most Yoga Classes Taken"
                value={challengeData.title}
                onChange={(e) => setChallengeData({...challengeData, title: e.target.value})}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                Description
              </label>
              <textarea
                className="w-full p-3 rounded-xl bg-black/40 border border-gray-600 text-white h-32 resize-none focus:border-[#D4AF37] outline-none"
                placeholder="Describe the challenge goals and rules..."
                value={challengeData.description}
                onChange={(e) => setChallengeData({...challengeData, description: e.target.value})}
              />
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl bg-black/40 border border-gray-600 text-white focus:border-[#D4AF37] outline-none"
                  value={challengeData.start_date}
                  onChange={(e) => setChallengeData({...challengeData, start_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-200">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 rounded-xl bg-black/40 border border-gray-600 text-white focus:border-[#D4AF37] outline-none"
                  value={challengeData.end_date}
                  onChange={(e) => setChallengeData({...challengeData, end_date: e.target.value})}
                />
              </div>
            </div>

            {/* Reward */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-200">
                Reward / Prize
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-black/40 border border-gray-600 text-white focus:border-[#D4AF37] outline-none"
                placeholder="e.g. Free Month Membership, Gym Merchandise..."
                value={challengeData.reward}
                onChange={(e) => setChallengeData({...challengeData, reward: e.target.value})}
              />
            </div>

            {/* Submit */}
          <div className="pt-4 flex justify-center">
              <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold shadow-xl hover:shadow-yellow-400/40 transition-all duration-300"
                  >
                  {loading ? "Creating..." : "Create Challenge"}
              </button>
          </div>

          {success && <p className="text-green-400 mt-2 text-center">Challenge created successfully!</p>}
          {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
          </form>
          </div>

        {/* Back to Staff Dashboard */}
        <div className="text-center mt-10 text-[#D4AF37]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
          >
            Back to Staff Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateChallengePage;
