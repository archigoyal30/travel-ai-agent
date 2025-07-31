import { Doc } from "../../convex/_generated/dataModel";

interface TripCardProps {
  trip: Doc<"trips">;
  onClick: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "planning":
        return {
          color: "from-yellow-400 to-orange-500",
          bgColor: "bg-yellow-50/80",
          textColor: "text-yellow-800",
          icon: "📝",
          label: "Planning"
        };
      case "confirmed":
        return {
          color: "from-green-400 to-emerald-500",
          bgColor: "bg-green-50/80",
          textColor: "text-green-800",
          icon: "✅",
          label: "Confirmed"
        };
      case "completed":
        return {
          color: "from-gray-400 to-slate-500",
          bgColor: "bg-gray-50/80",
          textColor: "text-gray-800",
          icon: "🏁",
          label: "Completed"
        };
      default:
        return {
          color: "from-gray-400 to-slate-500",
          bgColor: "bg-gray-50/80",
          textColor: "text-gray-800",
          icon: "📝",
          label: "Planning"
        };
    }
  };

  const statusConfig = getStatusConfig(trip.status);

  const getDaysCount = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getDestinationEmoji = (destination: string) => {
    const dest = destination.toLowerCase();
    if (dest.includes('paris') || dest.includes('france')) return '🇫🇷';
    if (dest.includes('tokyo') || dest.includes('japan')) return '🇯🇵';
    if (dest.includes('new york') || dest.includes('usa')) return '🇺🇸';
    if (dest.includes('london') || dest.includes('uk')) return '🇬🇧';
    if (dest.includes('rome') || dest.includes('italy')) return '🇮🇹';
    if (dest.includes('bali') || dest.includes('indonesia')) return '🇮🇩';
    return '🌍';
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/50 overflow-hidden hover:scale-[1.02]"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
              {trip.title}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} backdrop-blur-sm border border-white/30`}>
            {statusConfig.icon} {statusConfig.label}
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{getDestinationEmoji(trip.destination)}</span>
          <span className="text-lg font-semibold text-gray-700">{trip.destination}</span>
        </div>

        {/* Trip Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">📅</span>
            <span className="text-sm font-medium">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">👥</span>
            <span className="text-sm font-medium">
              {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
            </span>
          </div>
          
          {trip.budget && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm">💰</span>
              <span className="text-sm font-medium">${trip.budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {trip.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
            {trip.description}
          </p>
        )}

        {/* Preferences */}
        {trip.preferences && trip.preferences.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {trip.preferences.slice(0, 3).map((pref) => (
              <span
                key={pref}
                className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-100"
              >
                {pref}
              </span>
            ))}
            {trip.preferences.length > 3 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium border border-gray-200">
                +{trip.preferences.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-sm">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
