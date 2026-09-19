'use client';

import { OPERATIONS_ROOM_BADGES } from '@/lib/operationsRooms';

export default function OperationsRoomCard({ room, locked, completed, onClick }) {
  const badge = OPERATIONS_ROOM_BADGES[room.id];
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border p-5 transition-all duration-300 group ${locked ? 'border-gray-800 bg-gray-900/40 opacity-50 cursor-not-allowed' : completed ? 'border-indigo-600 bg-indigo-950/20 cursor-pointer hover:border-indigo-400' : 'border-gray-700 bg-gray-900 cursor-pointer hover:border-indigo-500'}`}
    >
      {locked && <div className="absolute top-4 right-4 text-gray-600 text-lg">🔒</div>}
      {completed && <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-black px-2 py-1 rounded-full">Done</div>}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${completed ? 'bg-indigo-500 text-white' : locked ? 'bg-gray-800 text-gray-600' : 'bg-indigo-900/50 text-indigo-400'}`}>
          {completed ? '✓' : room.icon}
        </div>
        <span className={`text-xs font-bold ${locked ? 'text-gray-600' : 'text-indigo-600'}`}>Room {room.number}</span>
      </div>
      <h3 className={`font-black text-base mb-1 leading-tight ${locked ? 'text-gray-600' : 'text-white'}`}>{room.title}</h3>
      <p className={`text-xs mb-3 leading-relaxed ${locked ? 'text-gray-700' : 'text-gray-400'}`}>{room.subtitle}</p>
      {!locked && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs">{room.tasks.length} tasks</span>
          {room.leadMagnet && (
            <div className="flex items-center gap-1 bg-indigo-950/50 border border-indigo-900/50 rounded-full px-2 py-0.5">
              <span className="text-xs">🧲</span>
              <span className="text-indigo-400 text-xs font-semibold">Lead Magnet</span>
            </div>
          )}
        </div>
      )}
      {completed && badge && (
        <div className="mt-3 pt-3 border-t border-indigo-900/30 flex items-center gap-2">
          <span className="text-base">{badge.emoji}</span>
          <span className="text-indigo-400 text-xs font-bold">{badge.name}</span>
        </div>
      )}
    </div>
  );
}
