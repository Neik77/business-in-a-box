
export default function FundingRoomCard({ room, isCompleted, isLocked, onClick }) {
  return (
    <div onClick={!isLocked ? onClick : undefined} className={"rounded-2xl border p-6 transition-all " + (isLocked ? "border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed" : isCompleted ? "border-green-500/50 bg-green-900/10 cursor-pointer hover:border-green-400" : "border-amber-500/30 bg-gray-900 cursor-pointer hover:border-amber-400")}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm">{room.icon}</div>
        <div>{isLocked ? <span className="text-gray-600 text-xs">LOCKED</span> : isCompleted ? <span className="text-green-400 text-xs font-bold">COMPLETE</span> : <span className="text-amber-400 text-xs font-bold">Room {room.number}</span>}</div>
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{room.title}</h3>
      <p className="text-gray-400 text-sm">{room.subtitle}</p>
    </div>
  );
}
