import { useState } from "react";
import { GiTrophyCup, GiPodiumWinner} from "react-icons/gi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { supabase } from "../../../lib/supabase"; 

const dummyChallenges = [
  {
    id: "challenge-1",
    title: "30-Day Push-Up Challenge",
    description: "See how many push-ups you can complete in 30 days.",
    reward: "Champion Badge",
    participants: [
      { id: "user1", username: "Alex", progress_value: 230, avatar_url: "https://placehold.co/40x40?text=A" },
      { id: "user2", username: "Jordan", progress_value: 180, avatar_url: "https://placehold.co/40x40?text=J" },
      { id: "user3", username: "Taylor", progress_value: 90, avatar_url: "https://placehold.co/40x40?text=T" },
    ],
  },
  {
    id: "challenge-2",
    title: "5KM Daily Run Challenge",
    description: "Run 5KM every day for 14 days straight.",
    reward: "Endurance Medal",
    participants: [
      { id: "user4", username: "Chris", progress_value: 70, avatar_url: "https://placehold.co/40x40?text=C" },
      { id: "user2", username: "Jordan", progress_value: 60, avatar_url: "https://placehold.co/40x40?text=J" },
    ],
  },
  {
    id: "challenge-3",
    title: "Gym Streak Challenge",
    description: "Hit the gym 20 times this month.",
    reward: "Streak Award",
    participants: [
      { id: "user5", username: "Mia", progress_value: 15, avatar_url: "https://placehold.co/40x40?text=M" },
      { id: "user1", username: "Alex", progress_value: 12, avatar_url: "https://placehold.co/40x40?text=A" },
      { id: "user3", username: "Taylor", progress_value: 8, avatar_url: "https://placehold.co/40x40?text=T" },
    ],
  },
];


interface ChallengeCarouselProps {
  userId: string;
}

export const ChallengeLeaderboard = ({ userId }: ChallengeCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challenges, setChallenges] = useState(dummyChallenges);
  const [isJoining, setIsJoining] = useState(false);

  const current = challenges[currentIndex];

  // --------------------
  // SUPABASE DATA FETCH 
  // --------------------
  //
  // useEffect(() => {
  //   const fetchChallenges = async () => {
  //     setLoading(true);
  //
  //     // Fetch all challenges
  //     const { data: challengesData, error: challengesError } = await supabase
  //       .from("challenges")
  //       .select("*")
  //       .order("created_at", { ascending: false });
  //
  //    
  //
  //     //  Fetch all participants for all challenges
  //     const { data: participantsData, error: participantsError } = await supabase
  //       .from("challenge_participants")
  //       .select("*, profiles(username, avatar_url)") 
  //       .order("progress_value", { ascending: false });
  //
  //
  //
  //     // Merge participants into their challenge
  //     const formatted = challengesData.map((challenge) => {
  //       const participants = participantsData
  //         .filter((p) => p.challenges_id === challenge.id)
  //         .map((p) => ({
  //           id: p.user_id,
  //           username: p.profiles?.username || "Unknown",
  //           progress_value: p.progress_value,
  //           avatar_url: p.profiles?.avatar_url || "https://placehold.co/40x40?text=?",
  //         }));
  //
  //       return { ...challenge, participants };
  //     });
  //
  //     setChallenges(formatted);
  //     setLoading(false);
  //   };
  //
  //   fetchChallenges();
  // }, []);
  //
  // --------------------

  const hasJoined = current.participants.some((p) => p.id === userId);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % challenges.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + challenges.length) % challenges.length);
  };

  const handleJoin = () => {
    setIsJoining(true);

    setTimeout(() => {
      const newChallenges = [...challenges];
      newChallenges[currentIndex].participants.push({
        id: userId,
        username: "You",
        progress_value: 0,
        avatar_url: "https://placehold.co/40x40?text=U",
      });

      setChallenges(newChallenges);
      setIsJoining(false);
    }, 800);
  };

  return (
    <div className="bg-gray-800/90 border border-gray-700/50 p-6 rounded-xl relative transition-all duration-300 hover:border-gold-400/30 hover:shadow-lg hover:shadow-gold-500/5">

      {/* Header + Arrows */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={goPrev} className="p-2 hover:bg-gray-700 rounded-full">
          <HiChevronLeft className="w-6 h-6 text-gray-200" />
        </button>

        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <GiTrophyCup className="w-7 h-7 text-gold-400" />
          {current.title}
        </h3>

        <button onClick={goNext} className="p-2 hover:bg-gray-700 rounded-full">
          <HiChevronRight className="w-6 h-6 text-gray-200" />
        </button>
      </div>

      {/* Description */}
      <p className="text-gray-400 mb-4 text-center">{current.description}</p>

      {/* Leaderboard */}
      <div className="max-h-64 overflow-y-auto space-y-3">
        {current.participants.length === 0 ? (
          <p className="text-gray-400 text-center py-5">No one has joined yet.</p>
        ) : (
          [...current.participants]
            .sort((a, b) => b.progress_value - a.progress_value)
            .map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-700/30 hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gold-400 font-bold text-xl w-8 text-center">
                    {index + 1}
                  </div>

                  <img
                    src={p.avatar_url}
                    className="w-10 h-10 rounded-full border border-gray-600"
                  />

                  <div>
                    <p className="text-gray-200 font-semibold">{p.username}</p>
                    <p className="text-gray-400 text-sm">Progress: {p.progress_value}</p>
                  </div>
                </div>

                {index === 0 && (
                  <GiPodiumWinner className="text-gold-300 w-7 h-7" />
                )}
              </div>
            ))
        )}
      </div>

      {/* Join button */}
      {!hasJoined ? (
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="mt-5 w-full px-6 py-4 bg-gold-500/90 hover:bg-gold-500 text-gray-900 rounded-xl font-bold shadow-lg"
        >
          {isJoining ? "Joining..." : "Join Challenge"}
        </button>
      ) : (
        <p className="mt-4 text-center text-green-400 font-semibold">
          You’ve joined this challenge!
        </p>
      )}
    </div>
  );
};
