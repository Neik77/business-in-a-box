'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { SALES_ROOMS, SALES_COACH, SALES_COMPLETION_REWARD } from '@/lib/salesRooms';
import KJCoach from '@/components/sales/KJCoach';
import SalesRoomCard from '@/components/sales/SalesRoomCard';

export default function SalesPage() {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completedRooms, setCompletedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => { loadUserData(); }, []);

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setProfile(profile);
        const completed = profile.sales_rooms_completed || [];
        setCompletedRooms(completed);
        if (completed.length === SALES_ROOMS.length && !profile.sales_certified) {
          setShowCelebration(true);
          await supabase.from('profiles').update({ sales_certified: true, badges_earned: [...(profile.badges_earned || []), 'Sales Room Certified'] }).eq('id', user.id);
        }
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }

  function isRoomLocked(roomIndex) {
    if (roomIndex === 0) return false;
    return !completedRooms.includes(SALES_ROOMS[roomIndex - 1].id);
  }

  const completionPercent = Math.round((completedRooms.length / SALES_ROOMS.length) * 100);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">💸</div>
        <p className="text-amber-400 font-semibold text-lg">KJ is setting up your Sales Room...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-amber-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">💸🏆💸</div>
            <h2 className="text-2xl font-black text-amber-400 mb-2">Sales Room Certified!</h2>
            <p className="text-gray-300 mb-6">KJ's seal of approval. You built a complete sales system from offer to close. Now go get the bag.</p>
            <button onClick={() => setShowCelebration(false)} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all">
              Let's Get This Money 💰
            </button>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-900 via-amber-950/20 to-gray-950 border-b border-amber-900/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-amber-400 transition-colors text-sm mb-4 block">← Dashboard</button>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">💸</span>
                <div>
                  <h1 className="text-3xl font-black text-white">Sales Room</h1>
                  <p className="text-amber-400 font-semibold">V4 — with KJ, your Sales Coach</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-xl">Build your complete sales system from offer to close. 9 rooms. Every tool you need to fill your pipeline and get paid consistently.</p>
            </div>
            <div className="bg-gray-900 border border-amber-900/40 rounded-2xl p-5 min-w-[220px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">Progress</span>
                <span className="text-amber-400 font-black text-lg">{completionPercent}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
              </div>
              <p className="text-gray-500 text-xs">{completedRooms.length} of {SALES_ROOMS.length} rooms complete</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <KJCoach completedCount={completedRooms.length} totalRooms={SALES_ROOMS.length} profileName={profile?.owner_name} />
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SALES_ROOMS.map((room, index) => (
            <SalesRoomCard key={room.id} room={room} locked={isRoomLocked(index)} completed={completedRooms.includes(room.id)}
              onClick={() => { if (!isRoomLocked(index)) router.push(`/sales/room/${room.id}`); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
