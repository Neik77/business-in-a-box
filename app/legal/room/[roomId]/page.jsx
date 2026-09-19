'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LEGAL_ROOMS, LEGAL_ROOM_BADGES } from '@/lib/legalRooms';
export default function LegalRoomPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const roomId = params.roomId;
  const room = LEGAL_ROOMS.find((r) => r.id === roomId);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!room) { router.push('/legal'); return; } loadRoomData(); }, [roomId]);
  async function loadRoomData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) { const saved = profile.legal_room_answers || {}; setAnswers(saved[roomId] || {}); setCompleted((profile.legal_rooms_completed || []).includes(roomId)); }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  }
  function handleAnswer(taskId, value) { setAnswers((prev) => ({ ...prev, [taskId]: value })); }
  function allTasksAnswered() { return room.tasks.every((task) => { const val = answers[task.id]; return val && val.toString().trim().length > 0; }); }
  async function saveProgress() {
    setSaving(true);
    try {
      const { data: cur } = await supabase.from('profiles').select('legal_room_answers').eq('id', user.id).single();
      const updated = { ...(cur?.legal_room_answers || {}), [roomId]: answers };
      await supabase.from('profiles').update({ legal_room_answers: updated }).eq('id', user.id);
      alert('Progress saved!');
    } catch (e) { alert('Error saving.'); }
    finally { setSaving(false); }
  }
  async function completeRoom() {
    if (!allTasksAnswered()) { alert('Please complete all tasks first.'); return; }
    setSaving(true);
    try {
      const { data: cur } = await supabase.from('profiles').select('legal_room_answers,legal_rooms_completed,badges_earned').eq('id', user.id).single();
      const updatedAnswers = { ...(cur?.legal_room_answers || {}), [roomId]: answers };
      const completedRooms = cur?.legal_rooms_completed || [];
      if (!completedRooms.includes(roomId)) completedRooms.push(roomId);
      const badge = LEGAL_ROOM_BADGES[roomId];
      const badges = cur?.badges_earned || [];
      if (badge && !badges.includes(badge.name)) badges.push(badge.name);
      await supabase.from('profiles').update({ legal_room_answers: updatedAnswers, legal_rooms_completed: completedRooms, badges_earned: badges }).eq('id', user.id);
      setCompleted(true); setShowBadge(true);
    } catch (e) { alert('Error completing room.'); }
    finally { setSaving(false); }
  }
  if (!room) return null;
  if (loading) return (<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-emerald-400">Loading...</p></div>);
  const badge = LEGAL_ROOM_BADGES[roomId];
  const roomIndex = LEGAL_ROOMS.findIndex((r) => r.id === roomId);
  const nextRoom = LEGAL_ROOMS[roomIndex + 1];
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showBadge && badge && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-emerald-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-xl font-black text-emerald-400 mb-2">Badge Earned!</h2>
            <p className="text-white font-bold text-lg mb-1">{badge.name}</p>
            <p className="text-gray-400 text-sm mb-6">Room {room.number} of 9 complete</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left"><p className="text-emerald-400 text-xs font-bold mb-1">Constance says:</p><p className="text-gray-300 text-sm italic">"{room.legal_tip}"</p></div>
            <div className="flex flex-col gap-3">
              {nextRoom && <button onClick={() => { setShowBadge(false); router.push(`/legal/room/${nextRoom.id}`); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition-all">Next: {nextRoom.title}</button>}
              <button onClick={() => { setShowBadge(false); router.push('/legal'); }} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all">Back to Legal Room</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gradient-to-br from-gray-900 via-emerald-950/20 to-gray-950 border-b border-emerald-900/30">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/legal')} className="text-gray-400 hover:text-emerald-400 text-sm mb-4 block">back to Legal Room</button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center text-sm font-black text-emerald-400">{room.icon}</div>
            <div>
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Legal Room {room.number} of {LEGAL_ROOMS.length}</span>
              {completed && <span className="ml-2 bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">Completed</span>}
              <h1 className="text-2xl font-black text-white">{room.title}</h1>
              <p className="text-gray-400 text-sm">{room.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-black text-white flex-shrink-0">C</div>
          <div><p className="text-emerald-400 text-xs font-bold mb-1">Constance says:</p><p className="text-gray-300 text-sm italic">"{room.legal_tip}"</p></div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6"><h2 className="text-white font-bold mb-2">About This Room</h2><p className="text-gray-400 text-sm leading-relaxed">{room.description}</p></div>
        <div className="space-y-5">
          <h2 className="text-white font-black text-lg">Your Tasks</h2>
          {room.tasks.map((task, i) => (
            <div key={task.id} className="bg-gray-900 border border-gray-800 hover:border-emerald-900/50 rounded-2xl p-5 transition-colors">
              <label className="block text-white font-semibold text-sm mb-3"><span className="text-emerald-500 font-black mr-2">{i + 1}.</span>{task.label}</label>
              {task.type === 'textarea' && <textarea value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} placeholder={task.placeholder} rows={4} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors" />}
              {task.type === 'input' && <input type="text" value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} placeholder={task.placeholder} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />}
              {task.type === 'select' && <select value={answers[task.id] || ''} onChange={(e) => handleAnswer(task.id, e.target.value)} className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-colors"><option value="" disabled>Select an option...</option>{task.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select>}
            </div>
          ))}
        </div>
        {room.leadMagnet && (
          <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-700/50 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">Room Lead Magnet</p>
                <h3 className="text-white font-black text-base mb-2">{room.leadMagnet.title}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{room.leadMagnet.description}</p>
                <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-5 py-2.5 rounded-xl transition-all">Download {room.leadMagnet.type}</button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button onClick={saveProgress} disabled={saving} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Save Progress'}</button>
          {!completed ? (
            <button onClick={completeRoom} disabled={saving || !allTasksAnswered()} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black py-3 rounded-xl transition-all disabled:cursor-not-allowed">{saving ? 'Completing...' : !allTasksAnswered() ? 'Complete All Tasks First' : `Complete Room ${room.number}`}</button>
          ) : (
            <button onClick={() => nextRoom ? router.push(`/legal/room/${nextRoom.id}`) : router.push('/legal')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl transition-all">{nextRoom ? `Next: ${nextRoom.title}` : 'View Legal Room Summary'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
