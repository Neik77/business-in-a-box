
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FUNDING_ROOMS } from "@/lib/fundingRooms";

export default function FundingRoomPage() {
  const router = useRouter();
  const { roomId } = useParams();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState([]);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  const room = FUNDING_ROOMS.find(r => r.id === roomId);
  const roomIndex = FUNDING_ROOMS.findIndex(r => r.id === roomId);
  const nextRoom = FUNDING_ROOMS[roomIndex + 1] || null;
  const isCompleted = completed.includes(roomId);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("funding_rooms_completed,funding_room_answers").eq("id", user.id).single();
      if (data) {
        setCompleted(data.funding_rooms_completed || []);
        setAnswers((data.funding_room_answers || {})[roomId] || {});
      }
    };
    load();
  }, [roomId]);

  if (!room) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Room not found</div>;

  const allTasksAnswered = () => room.tasks.every(t => answers[t.id] && answers[t.id].toString().trim() !== "");

  const saveProgress = async () => {
    setSaving(true);
    const { data } = await supabase.from("profiles").select("funding_room_answers").eq("id", userId).single();
    const existing = data?.funding_room_answers || {};
    await supabase.from("profiles").update({ funding_room_answers: { ...existing, [roomId]: answers } }).eq("id", userId);
    setSaving(false);
  };

  const completeRoom = async () => {
    setSaving(true);
    const { data } = await supabase.from("profiles").select("funding_rooms_completed,funding_room_answers").eq("id", userId).single();
    const existing = data?.funding_room_answers || {};
    const newCompleted = [...new Set([...(data?.funding_rooms_completed || []), roomId])];
    const allDone = newCompleted.length === FUNDING_ROOMS.length;
    await supabase.from("profiles").update({ funding_rooms_completed: newCompleted, funding_room_answers: { ...existing, [roomId]: answers }, funding_certified: allDone }).eq("id", userId);
    setCompleted(newCompleted);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-4"><button onClick={() => router.push("/funding")} className="text-amber-400 hover:text-amber-300 text-sm">Back to Funding Department</button></div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">Room {room.number}</span>
            {isCompleted && <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">COMPLETE</span>}
          </div>
          <h1 className="text-3xl font-black mb-2">{room.title}</h1>
          <p className="text-amber-400 font-semibold mb-3">{room.subtitle}</p>
          <p className="text-gray-300">{room.description}</p>
        </div>
        <div className="space-y-6 mb-8">
          {room.tasks.map(task => (
            <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">{task.label}</label>
              {task.type === "select" ? (
                <select value={answers[task.id] || ""} onChange={e => setAnswers({...answers, [task.id]: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none">
                  <option value="">Select an option</option>
                  {task.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : task.type === "textarea" ? (
                <textarea value={answers[task.id] || ""} onChange={e => setAnswers({...answers, [task.id]: e.target.value})} placeholder={task.placeholder} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none" />
              ) : (
                <input value={answers[task.id] || ""} onChange={e => setAnswers({...answers, [task.id]: e.target.value})} placeholder={task.placeholder} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none" />
              )}
            </div>
          ))}
        </div>
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 mb-8">
          <p className="text-amber-300 text-sm font-semibold">Meika says: {room.funding_tip}</p>
        </div>
        {room.leadMagnet && (
          <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-amber-400 font-bold mb-1">Free Resource: {room.leadMagnet.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{room.leadMagnet.description}</p>
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm px-5 py-2.5 rounded-xl transition-all">Download {room.leadMagnet.type}</button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button onClick={saveProgress} disabled={saving} className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">{saving ? "Saving..." : "Save Progress"}</button>
          {!isCompleted ? (
            <button onClick={completeRoom} disabled={saving || !allTasksAnswered()} className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 rounded-xl transition-all disabled:cursor-not-allowed">{saving ? "Completing..." : !allTasksAnswered() ? "Complete All Tasks First" : "Complete Room " + room.number}</button>
          ) : (
            <button onClick={() => nextRoom ? router.push("/funding/room/" + nextRoom.id) : router.push("/funding")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all">{nextRoom ? "Next: " + nextRoom.title : "View Funding Summary"}</button>
          )}
        </div>
      </div>
    </div>
  );
}
