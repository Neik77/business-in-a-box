'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LEGAL_ROOMS, LEGAL_COMPLETION_REWARD } from '@/lib/legalRooms';
import ConstanceCoach from '@/components/legal/ConstanceCoach';
import LegalRoomCard from '@/components/legal/LegalRoomCard';
export default function LegalPage() {
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
        const completed = profile.legal_rooms_completed || [];
        setCompletedRooms(completed);
        if (completed.length === LEGAL_ROOMS.length && !profile.legal_certified) {
          setShowCelebration(true);
          await supabase.from('profiles').update({ legal_certified: true, badges_earned: [...(profile.badges_earned || []), 'Legal and Setup Room Certified'] }).eq('id', user.id);
        }
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }
  function isRoomLocked(roomIndex) { if (roomIndex === 0) return false; return !completedRooms.includes(LEGAL_ROOMS[roomIndex - 1].id); }
  const completionPercent = Math.round((completedRooms.length / LEGAL_ROOMS.length) * 100);
  if (loading) return (<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-center"><p className="text-emerald-400 font-semibold text-lg">Constance is setting up your Legal Room...</p></div></div>);
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-emerald-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black text-emerald-400 mb-2">Legal Room Certified!</h2>
            <p className="text-gray-300 mb-6">{LEGAL_COMPLETION_REWARD.message}</p>
            <button onClick={() => setShowCelebration(false)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition-all">Keep Building</button>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-900 via-emerald-950/20 to-gray-950 border-b border-emerald-900/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm mb-4 block">back to Dashboard</button>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white">Legal and Setup Room</h1>
              <p className="text-emerald-400 font-semibold">V6 - with Constance, your Legal Coach</p>
              <p className="text-gray-400 max-w-xl mt-2">Build your legal foundation. 9 rooms covering everything from your business structure to your annual legal review.</p>
            </div>
            <div className="bg-gray-900 border border-emerald-900/40 rounded-2xl p-5 min-w-[220px]">
              <div className="flex items-center justify-between mb-3"><span className="text-gray-400 text-sm font-semibold">Progress</span><span className="text-emerald-400 font-black text-lg">{completionPercent}%</span></div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-3"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} /></div>
              <p className="text-gray-500 text-xs">{completedRooms.length} of {LEGAL_ROOMS.length} rooms complete</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6"><ConstanceCoach completedCount={completedRooms.length} totalRooms={LEGAL_ROOMS.length} profileName={profile?.owner_name} /></div>
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEGAL_ROOMS.map((room, index) => (
            <LegalRoomCard key={room.id} room={room} locked={isRoomLocked(index)} completed={completedRooms.includes(room.id)} onClick={() => { if (!isRoomLocked(index)) router.push(`/legal/room/${room.id}`); }} />
          ))}
        </div>
      </div>
    </div>
  );
}
