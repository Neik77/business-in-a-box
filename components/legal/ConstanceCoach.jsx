'use client';
const CONSTANCE_MESSAGES = {
  0: "Hey, I am Constance. Your Legal Coach. We are about to make sure your business is protected at every level. Start with Room 1. No shortcuts.",
  1: "Business structure locked in. That is your legal foundation. Everything else builds on this.",
  2: "EIN secured. Your business has an identity now. Use it.",
  3: "Contracts in place. You just closed the door on handshake deals forever.",
  4: "Business bank account set up. Your money is clean and trackable now.",
  5: "Licenses and permits checked. You are legally allowed to operate. That matters.",
  6: "Trademark and IP reviewed. Your brand is protected. Nobody can take what you secured.",
  7: "Privacy policy and terms live. You are compliant. Your customers can trust you.",
  8: "Tax situation organized. You know what you owe and what you can keep.",
  9: "Legal and Setup Room CERTIFIED. Structure. EIN. Contracts. Banking. Licenses. Trademark. Privacy. Taxes. Annual review. Constance approved. You are legally protected.",
};
export default function ConstanceCoach({ completedCount, totalRooms, profileName }) {
  const message = CONSTANCE_MESSAGES[completedCount] || CONSTANCE_MESSAGES[0];
  const firstName = profileName?.split(' ')[0] || 'Boss';
  return (
    <div className="bg-gradient-to-r from-emerald-950/40 to-gray-900 border border-emerald-800/40 rounded-2xl p-5 flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl font-black text-white shadow-lg">C</div>
        <p className="text-center text-emerald-400 text-xs font-bold mt-1">Legal Coach</p>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white font-black text-sm">Constance</span>
          <span className="bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-semibold">Packaging and Launch Specialist</span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{firstName !== 'Boss' ? `${firstName}, ` : ''}{message}</p>
        {completedCount > 0 && completedCount < totalRooms && (
          <p className="text-emerald-500 text-xs mt-2 font-semibold">{totalRooms - completedCount} room{totalRooms - completedCount !== 1 ? 's' : ''} left to complete your Legal Setup.</p>
        )}
      </div>
    </div>
  );
}
