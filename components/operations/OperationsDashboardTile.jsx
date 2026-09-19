'use client';

import { useRouter } from 'next/navigation';
import { OPERATIONS_ROOMS } from '@/lib/operationsRooms';

export default function OperationsDashboardTile({ completedRooms = [], certified = false }) {
  const router = useRouter();
  const completionPercent = Math.round((completedRooms.length / OPERATIONS_ROOMS.length) * 100);
  return (
    <div onClick={() => router.push('/operations')} className="bg-gradient-to-br from-indigo-950/30 to-gray-900 border border-indigo-800/40 hover:border-indigo-500 rounded-2xl p-5 cursor-pointer transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center text-xl">⚙️</div>
          <div>
            <h3 className="text-white font-black text-sm">Operations Center</h3>
            <p className="text-indigo-600 text-xs font-semibold">V5 — Coach Quilla</p>
          </div>
        </div>
        {certified && <span className="bg-indigo-500 text-white text-xs font-black px-2 py-1 rounded-full">Certified</span>}
      </div>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-500 text-xs">{completedRooms.length}/{OPERATIONS_ROOMS.length} rooms</span>
          <span className="text-indigo-400 text-xs font-bold">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{completedRooms.length === 0 ? 'Start building your operations' : completedRooms.length === OPERATIONS_ROOMS.length ? 'Operations certified' : `Room ${completedRooms.length + 1} up next`}</span>
        <span className="text-indigo-700 group-hover:text-indigo-400 transition-all text-sm">→</span>
      </div>
    </div>
  );
}
