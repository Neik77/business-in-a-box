'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { OPERATIONS_ROOMS, OPERATIONS_COMPLETION_REWARD } from '@/lib/operationsRooms';
import QuillaCoach from '@/components/operations/QuillaCoach';
import OperationsRoomCard from '@/components/operations/OperationsRoomCard';

export default function OperationsPage() {
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
        const completed = profile.operations_rooms_completed || [];
        setCompletedRooms(completed);
        if (completed.length === OPERATIONS_ROOMS.length && !profile.operations_certified) {
          setShowCelebration(true);
          await supabase.from('profiles').update({ operations_certified: true, badges_earned: [...(profile.badges_earned || []), 'Operations Center Certified'] }).eq('id', user.id);
        }
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }

  function isRoomLocked(roomIndex) {
    if (roomIndex === 0) return false;
    return !completedRooms.includes(OPERATIONS_ROOMS[roomIndex - 1].id);
  }

  const completionPercent = Math.round((completedRooms.length / OPERATIONS_ROOMS.length) * 100);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">⚙️</div>
        <p className="text-indigo-400 font-semibold text-lg">Quilla is setting up your Operations Center...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-indigo-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">⚙️🏆⚙️</div>
            <h2 className="text-2xl font-black text-indigo-400 mb-2">Operations Center Certified!</h2>
            <p className="text-gray-300 mb-6">{OPERATIONS_COMPLETION_REWARD.message}</p>
            <button onClick={() => setShowCelebration(false)} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3 rounded-xl transition-all">
              Let's Keep Building
            </button>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-950/20 to-gray-950 border-b border-indigo-900/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-indigo-400 transition-colors text-sm mb-4 block">← Dashboard</button>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">⚙️</span>
                <div>
                  <h1 className="text-3xl font-black text-white">Operations Center</h1>
                  <p className="text-indigo-400 font-semibold">V5 — with Quilla, your Operations Coach</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-xl">Build the systems, processes, and workflows that make your business run without chaos. 9 rooms. Everything you need to operate like a real business.</p>
            </div>
            <div className="bg-gray-900 border border-indigo-900/40 rounded-2xl p-5 min-w-[220px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-semibold">Progress</span>
                <span className="text-indigo-400 font-black text-lg">{completionPercent}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
              </div>
              <p className="text-gray-500 text-xs">{completedRooms.length} of {OPERATIONS_ROOMS.length} rooms complete</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <QuillaCoach completedCount={completedRooms.length} totalRooms={OPERATIONS_ROOMS.length} profileName={profile?.owner_name} />
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OPERATIONS_ROOMS.map((room, index) => (
            <OperationsRoomCard key={room.id} room={room} locked={isRoomLocked(index)} completed={completedRooms.includes(room.id)}
              onClick={() => { if (!isRoomLocked(index)) router.push(`/operations/room/${room.id}`); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
