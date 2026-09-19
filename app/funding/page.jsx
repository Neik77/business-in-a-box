
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FUNDING_ROOMS, FUNDING_COACH, FUNDING_COMPLETION_REWARD } from "@/lib/fundingRooms";
import MeikaCoach from "@/components/funding/MeikaCoach";
import FundingRoomCard from "@/components/funding/FundingRoomCard";

export default function FundingPage() {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [completed, setCompleted] = useState([]);
  const [certified, setCertified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("funding_rooms_completed,funding_certified").eq("id", user.id).single();
      if (data) { setCompleted(data.funding_rooms_completed || []); setCertified(data.funding_certified || false); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-amber-400 text-xl">Loading Funding Department...</div></div>;

  const completedCount = completed.length;
  const totalRooms = FUNDING_ROOMS.length;
  const progressPct = Math.round((completedCount / totalRooms) * 100);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-4"><button onClick={() => router.push("/dashboard")} className="text-amber-400 hover:text-amber-300 text-sm">Back to Dashboard</button></div>
        <MeikaCoach completedCount={completedCount} totalRooms={totalRooms} certified={certified} />
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2"><span>{completedCount} of {totalRooms} rooms complete</span><span>{progressPct}%</span></div>
          <div className="w-full bg-gray-800 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: progressPct + "%" }}></div></div>
        </div>
        {certified && (
          <div className="mb-8 p-6 bg-amber-900/30 border border-amber-500 rounded-2xl text-center">
            <div className="text-4xl mb-2">FUND</div>
            <div className="text-amber-400 text-xl font-bold">{FUNDING_COMPLETION_REWARD.badge}</div>
            <div className="text-gray-300 mt-2">{FUNDING_COMPLETION_REWARD.message}</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FUNDING_ROOMS.map((room, idx) => (
            <FundingRoomCard key={room.id} room={room} isCompleted={completed.includes(room.id)} isLocked={idx > 0 && !completed.includes(FUNDING_ROOMS[idx-1].id)} onClick={() => router.push("/funding/room/" + room.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
