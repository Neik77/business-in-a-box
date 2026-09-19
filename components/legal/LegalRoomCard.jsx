'use client';
import { LEGAL_ROOM_BADGES } from '@/lib/legalRooms';
export default function LegalRoomCard({ room, locked, completed, onClick }) {
  const badge = LEGAL_ROOM_BADGES[room.id];
  return (
    <div onClick={onClick} className={`relative rounded-2xl border p-5 transition-all duration-300 group ${locked ? 'border-gray-800 bg-gray-900/40 opacity-50 cursor-not-allowed' : completed ? 'border-emerald-600 bg-emerald-950/20 cursor-pointer hover:border-emerald-400' : 'border-gray-700 bg-gray-900 cursor-pointer hover:border-emerald-500'}`}>
      {locked && <div className="absolute top-4 right-4 text-gray-600 text-lg">locked</div>}
      {completed && <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-black px-2 py-1 rounded-full">Done</div>}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${completed ? 'bg-emerald-500 text-white' : locked ? 'bg-gray-800 text-gray-600' : 'bg-emerald-900/50 text-emerald-400'}`}>{completed ? 'done' : room.icon}</div>
        <span className={`text-xs font-bold ${locked ? 'text-gray-600' : 'text-emerald-600'}`}>Room {room.number}</span>
      </div>
      <h3 className={`font-black text-base mb-1 leading-tight ${locked ? 'text-gray-600' : 'text-white'}`}>{room.title}</h3>
      <p className={`text-xs mb-3 leading-relaxed ${locked ? 'text-gray-700' : 'text-gray-400'}`}>{room.subtitle}</p>
      {!locked && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{room.tasks.length} tasks</span>
          {room.leadMagnet && <div className="flex items-center gap-1 bg-emerald-950/50 border border-emerald-900/50 rounded-full px-2 py-0.5"><span className="text-emerald-400 text-xs font-semibold">Lead Magnet</span></div>}
        </div>
      )}
      {completed && badge && <div className="mt-3 pt-3 border-t border-emerald-900/30 flex items-center gap-2"><span className="text-emerald-400 text-xs font-bold">{badge.emoji} {badge.name}</span></div>}
    </div>
  );
}
