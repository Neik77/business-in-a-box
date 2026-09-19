'use client';

const QUILLA_MESSAGES = {
  0: "Hey, I am Quilla. Your Operations Coach. We are about to build the systems that make your business run without you losing your mind. Start with Room 1. Let's go.",
  1: "SOPs done. You just documented your first process. That is one less thing that only lives in your head. Keep going.",
  2: "Client systems built. Your clients are going to feel the difference. That is your reputation on autopilot now.",
  3: "Tool stack audited. You know exactly what you are paying for and what needs to go. Lean and clean.",
  4: "Delegation system ready. You are one step closer to not being the only one who can run this business.",
  5: "Workflows mapped. You can see your business clearly now. That clarity is going to save you hours every week.",
  6: "Time blocks protected. Your calendar finally matches your priorities. Guard it like your money.",
  7: "Communication standards set. No more missed messages or boundary violations. You run a professional operation now.",
  8: "Automations built. Tasks you used to do manually are now handled. Your time just got more valuable.",
  9: "Operations Center CERTIFIED. SOPs. Client systems. Tool stack. Delegation. Workflows. Time blocks. Communication. Automation. Health checks. Quilla approved. Go run your business.",
};

export default function QuillaCoach({ completedCount, totalRooms, profileName }) {
  const message = QUILLA_MESSAGES[completedCount] || QUILLA_MESSAGES[0];
  const firstName = profileName?.split(' ')[0] || 'Boss';

  return (
    <div className="bg-gradient-to-r from-indigo-950/40 to-gray-900 border border-indigo-800/40 rounded-2xl p-5 flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
          Q
        </div>
        <p className="text-center text-indigo-400 text-xs font-bold mt-1">Ops Coach</p>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-black text-sm">Quilla</span>
          <span className="bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-semibold">
            Supervisor & Program Director
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {firstName !== 'Boss' ? `${firstName}, ` : ''}{message}
        </p>
        {completedCount > 0 && completedCount < totalRooms && (
          <p className="text-indigo-500 text-xs mt-2 font-semibold">
            {totalRooms - completedCount} room{totalRooms - completedCount !== 1 ? 's' : ''} left to complete your Operations Center.
          </p>
        )}
      </div>
    </div>
  );
}
