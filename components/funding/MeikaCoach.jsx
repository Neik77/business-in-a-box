
export default function MeikaCoach({ completedCount, totalRooms, certified }) {
  const getMessage = () => {
    if (certified) return "You did the work. You know your funding options, your capital stack, and your next move. Meika approved.";
    if (completedCount === 0) return "Hey, it is Meika. I research opportunities for a living. This department is going to show you every funding option available to your business and help you build a capital strategy that actually makes sense.";
    if (completedCount < 4) return "Good start. You are learning how money actually moves. Keep going - the best funding options are in the rooms ahead.";
    if (completedCount < 7) return "You are halfway through and already ahead of most business owners. Keep stacking the knowledge.";
    return "Almost there. Finish strong. Your funding strategy is almost complete.";
  };
  return (
    <div className="bg-gradient-to-r from-amber-900/30 to-gray-900 border border-amber-500/30 rounded-2xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-xl flex-shrink-0">M</div>
        <div>
          <div className="text-amber-400 font-bold text-lg">Meika</div>
          <div className="text-gray-400 text-sm mb-3">Research and Opportunity Scout</div>
          <p className="text-gray-200 text-sm leading-relaxed">{getMessage()}</p>
          {certified && <div className="mt-3 inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">FUND - Funding Department Certified</div>}
        </div>
      </div>
    </div>
  );
}
