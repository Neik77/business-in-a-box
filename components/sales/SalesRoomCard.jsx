'use client';

import { SALES_ROOM_BADGES } from '@/lib/salesRooms';

export default function SalesRoomCard({ room, locked, completed, onClick }) {
  const badge = SALES_ROOM_BADGES[room.id];
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border p-5 transition-all duration-300 group ${locked ? 'border-gray-800 bg-gray-900/40 opacity-50 cursor-not-allowed' : completed ? 'border-amber-600 bg-amber-950/20 cursor-pointer hover:border-amber-400' : 'border-gray-700 bg-gray-900 cursor-pointer hover:border-amber-500'}`}
    >
      {locked && <div className="absolute top-4 right-4 text-gray-600 text-lg">🔒</div>}
      {completed && <div className="absolute top-4 right-4 bg-amber-500 text-black text-xs font-black px-2 py-1 rounded-full">✓ Done</div>}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${completed ? 'bg-amber-500 text-black' : locked ? 'bg-gray-800 text-gray-600' : 'bg-amber-900/50 text-amber-400'}`}>
          {completed ? '✓' : room.icon}
        </div>
        <span className={`text-xs font-bold ${locked ? 'text-gray-600' : 'text-amber-600'}`}>Room {room.number}</span>
      </div>
      <h3 className={`font-black text-base mb-1 leading-tight ${locked ? 'text-gray-600' : 'text-white'}`}>{room.title}</h3>
      <p className={`text-xs mb-3 leading-relaxed ${locked ? 'text-gray-700' : 'text-gray-400'}`}>{room.subtitle}</p>
      {!locked && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{room.tasks.length} tasks</span>
          {room.leadMagnet && (
            <div className="flex items-center gap-1 bg-amber-950/50 border border-amber-900/50 rounded-full px-2 py-0.5">
              <span className="text-xs">🧲</span>
              <span className="text-amber-400 text-xs font-semibold">Lead Magnet</span>
            </div>
          )}
        </div>
      )}
      {completed && badge && (
        <div className="mt-3 pt-3 border-t border-amber-900/30 flex items-center gap-2">
          <span className="text-base">{badge.emoji}</span>
          <span className="text-amber-400 text-xs font-bold">{badge.name}</span>
        </div>
      )}
    </div>
  );
}
