'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { SALES_ROOMS, SALES_ROOM_BADGES } from '@/lib/salesRooms';

export default function SalesRoomPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const roomId = params.roomId;
  const room = SALES_ROOMS.find((r) => r.id === roomId);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!room) { router.push('/sales'); return; }
    loadRoomData();
  }, [roomId]);

  async function loadRoomData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setProfile(profile);
        const savedAnswers = profile.sales_room_answers || {};
        setAnswers(savedAnswers[roomId] || {});
        setCompleted((profile.sales_rooms_completed || []).includes(roomId));
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }

  function handleAnswer(taskId, value) { setAnswers((prev) => ({ ...prev, [taskId]: value })); }
  function allTasksAnswered() { return room.tasks.every((task) => { const val = answers[task.id]; return val && val.toString().trim().length > 0; }); }

  async function saveProgress() {
    setSaving(true);
    try {
      const { data: cur } = await supabase.from('profiles').select('sales_room_answers').eq('id', user.id).single();
      const updated = { ...(cur?.sales_room_answers || {}), [roomId]: answers };
      await supabase.from('profiles').update({ sales_room_answers: updated }).eq('id', user.id);
      alert('Progress saved!');
    } catch (e) { alert('Error saving. Try again.'); }
    finally { setSaving(false); }
  }

  async function completeRoom() {
    if (!allTasksAnswered()) { alert('Please complete all tasks first.'); return; }
    setSaving(true);
    try {
      const { data: cur } = await supabase.from('profiles').select('sales_room_answers,sales_rooms_completed,badges_earned').eq('id', user.id).single();
      const updatedAnswers = { ...(cur?.sales_room_answers || {}), [roomId]: answers };
      const completedRooms = cur?.sales_rooms_completed || [];
      if (!completedRooms.includes(roomId)) completedRooms.push(roomId);
      const badge = SALES_ROOM_BADGES[roomId];
      const badges = cur?.badges_earned || [];
      if (badge && !badges.includes(badge.name)) badges.push(badge.name);
      await supabase.from('profiles').update({ sales_room_answers: updatedAnswers, sales_rooms_completed: completedRooms, badges_earned: badges }).eq('id', user.id);
      setCompleted(true);
      setShowBadge(true);
    } catch (e) { alert('Error completing room. Try again.'); }
    finally { setSaving(false); }
  }

  if (!room) return null;
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center"><div className="text-4xl mb-4 animate-bounce">{room?.icon || '💸'}</div><p className="text-amber-400">Loading...</p></div>
    </div>
  );

  const badge = SALES_ROOM_BADGES[roomId];
  const roomIndex = SALES_ROOMS.findIndex((r) => r.id === roomId);
  const nextRoom = SALES_ROOMS[roomIndex + 1];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showBadge && badge && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-amber-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">{badge.emoji}</div>
            <h2 className="text-xl font-black text-amber-400 mb-2">Badge Earned!</h2>
            <p className="text-white font-bold text-lg mb-1">{badge.name}</p>
            <p className="text-gray-400 text-sm mb-6">Room {room.number} of 9 complete</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-400 text-xs font-bold mb-1">KJ says:</p>
              <p className="text-gray-300 text-sm italic">"{room.kj_tip}"</p>
            </div>
            <div className="flex flex-col gap-3">
              {nextRoom && (
                <button onClick={() => { setShowBadge(false); router.push(`/sales/room/${nextRoom.id}`); }} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all">
                  Next: {nextRoom.title} →
                </button>
              )}
              <button onClick={() => { setShowBadge(false); router.push('/sales'); }} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all">
                Back to Sales Room
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-900 via-amber-950/20 to-gray-950 border-b border-amber-900/30">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/sales')} className="text-gray-400 hover:text-amber-400 text-sm mb-4 flex items-center gap-2 transition-colors">← Back to Sales Room</button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-3xl">{room.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Sales Room {room.number} of {SALES_ROOMS.length}</span>
                {completed && <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">✓ Completed</span>}
              </div>
              <h1 className="text-2xl font-black text-white">{room.title}</h1>
              <p className="text-gray-400 text-sm">{room.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-sm font-black text-black flex-shrink-0">KJ</div>
          <div><p className="text-amber-400 text-xs font-bold mb-1">KJ's Take</p><p className="text-gray-300 text-sm italic">"{room.kj_tip}"</p></div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-2">About This Room</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{room.description}</p>
        </div>
        <div className="space-y-5">
          <h2 className="text-white font-black text-lg">Your Tasks</h2>
          {room.tasks.map((task, i) => (
            <div key={task.id} className="bg-gray-900 border border-gray-800 hover:border-amber-900/50 rounded-2xl p-5 transition-colors">
              <label className="block text-white font-semibold text-sm mb-3">
                <span className="text-amber-500 font-black mr-2">{i + 1}.</span>{task.label}
              </label>
              {task.type === 'textarea' && <textarea value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} placeholder={task.placeholder} rows={4} className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors" />}
              {task.type === 'input' && <input type="text" value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} placeholder={task.placeholder} className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />}
              {task.type === 'select' && (
                <select value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-amber-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors">
                  <option value="" disabled>Select your format...</option>
                  {task.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
        {room.leadMagnet && (
          <div className="bg-gradient-to-br from-amber-950/40 to-gray-900 border border-amber-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">🧲</div>
              <div className="flex-1">
                <p className="text-amber-400 text-xs font-black uppercase tracking-wider mb-1">Room Lead Magnet</p>
                <h3 className="text-white font-black text-base mb-2">{room.leadMagnet.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{room.leadMagnet.description}</p>
                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all">
                  Download {room.leadMagnet.type}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button onClick={saveProgress} disabled={saving} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Progress'}
          </button>
          {!completed ? (
            <button onClick={completeRoom} disabled={saving || !allTasksAnswered()} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 rounded-xl transition-all disabled:cursor-not-allowed">
              {saving ? 'Completing...' : !allTasksAnswered() ? 'Complete All Tasks First' : `Complete Room ${room.number} ✓`}
            </button>
          ) : (
            <button onClick={() => nextRoom ? router.push(`/sales/room/${nextRoom.id}`) : router.push('/sales')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all">
              {nextRoom ? `Next: ${nextRoom.title} →` : 'View Sales Room Summary →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
