'use client';

import { useRouter } from 'next/navigation';
import { SALES_ROOMS } from '@/lib/salesRooms';

export default function SalesDashboardTile({ completedRooms = [], certified = false }) {
  const router = useRouter();
  const completionPercent = Math.round((completedRooms.length / SALES_ROOMS.length) * 100);
  return (
    <div onClick={() => router.push('/sales')} className="bg-gradient-to-br from-amber-950/30 to-gray-900 border border-amber-800/40 hover:border-amber-500 rounded-2xl p-5 cursor-pointer transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/50 flex items-center justify-center text-xl">💸</div>
          <div>
            <h3 className="text-white font-black text-sm">Sales Room</h3>
            <p className="text-amber-600 text-xs font-semibold">V4 — Coach KJ</p>
          </div>
        </div>
        {certified && <span className="bg-amber-500 text-black text-xs font-black px-2 py-1 rounded-full">Certified</span>}
      </div>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-500 text-xs">{completedRooms.length}/{SALES_ROOMS.length} rooms</span>
          <span className="text-amber-400 text-xs font-bold">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{completedRooms.length === 0 ? 'Start building your sales system' : completedRooms.length === SALES_ROOMS.length ? 'Sales system complete' : `Room ${completedRooms.length + 1} up next`}</span>
        <span className="text-amber-700 group-hover:text-amber-400 transition-all text-sm">→</span>
      </div>
    </div>
  );
}
