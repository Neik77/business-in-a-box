'use client';

import { SALES_COACH } from '@/lib/salesRooms';

const KJ_MESSAGES = {
  0: "What's good! I'm KJ — your Sales Coach. Ready to build your money machine? Start with Room 1 and let's get moving.",
  1: "First room down. You know your offer now. That's the foundation everything else is built on. Keep it moving.",
  2: "Two rooms complete. You know who you're selling to AND what you're selling. More clarity than 90% of people out here.",
  3: "Lead magnet built and deployed. Your pipeline is starting to fill. This is where the real money starts.",
  4: "You've got your script. Practice it until it sounds like YOU, not a script. Authenticity closes deals.",
  5: "Objection Handler done. You're ready for every no now. Remember — objections mean they're interested.",
  6: "Pipeline set up. You can't close what you can't track. You're operating like a real sales pro now.",
  7: "Follow-up system built. Most people never even make it here. You just unlocked one of the biggest money-makers in the game.",
  8: "Your close game is sharp. Ask for the sale. Ask clearly. Ask confidently.",
  9: "Sales Room CERTIFIED. You built a complete sales system from scratch. The bag is ready when you are. 💸",
};

export default function KJCoach({ completedCount, totalRooms, profileName }) {
  const message = KJ_MESSAGES[completedCount] || KJ_MESSAGES[0];
  const firstName = profileName?.split(' ')[0] || 'Boss';

  return (
    <div className="bg-gradient-to-r from-amber-950/40 to-gray-900 border border-amber-800/40 rounded-2xl p-5 flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-2xl font-black text-black shadow-lg">
          KJ
        </div>
        <p className="text-center text-amber-400 text-xs font-bold mt-1">Sales Coach</p>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-black text-sm">KJ</span>
          <span className="bg-amber-900/50 border border-amber-700 text-amber-300 text-xs px-2 py-0.5 rounded-full font-semibold">
            Lead Gen & Conversion
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {firstName !== 'Boss' ? `${firstName}, ` : ''}{message}
        </p>
        {completedCount > 0 && completedCount < totalRooms && (
          <p className="text-amber-500 text-xs mt-2 font-semibold">
            {totalRooms - completedCount} room{totalRooms - completedCount !== 1 ? 's' : ''} left to complete your Sales System.
          </p>
        )}
      </div>
    </div>
  );
}
