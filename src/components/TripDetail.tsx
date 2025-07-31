import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

interface TripDetailProps {
  tripId: Id<"trips">;
  onBack: () => void;
}

export function TripDetail({ tripId, onBack }: TripDetailProps) {
  const trip = useQuery(api.trips.getTrip, { tripId });
  const itinerary = useQuery(api.trips.getTripItinerary, { tripId });
  const updateStatus = useMutation(api.trips.updateTripStatus);
  const regenerateItinerary = useMutation(api.trips.regenerateItinerary);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (trip === undefined || itinerary === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStatusChange = async (newStatus: "planning" | "confirmed" | "completed") => {
    try {
      await updateStatus({ tripId, status: newStatus });
      toast.success(`🎉 Trip status updated to ${newStatus}!`);
    } catch (error) {
      toast.error("Failed to update trip status");
    }
  };

  const handleRegenerateItinerary = async () => {
    setIsRegenerating(true);
    try {
      await regenerateItinerary({ tripId });
      toast.success("🔄 Regenerating your itinerary with fresh AI insights!");
    } catch (error) {
      toast.error("Failed to regenerate itinerary");
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCategoryConfig = (category: string) => {
    const configs: Record<string, { icon: string; color: string; bgColor: string }> = {
      sightseeing: { icon: "🏛️", color: "text-purple-700", bgColor: "bg-purple-50" },
      food: { icon: "🍽️", color: "text-orange-700", bgColor: "bg-orange-50" },
      transport: { icon: "🚗", color: "text-blue-700", bgColor: "bg-blue-50" },
      accommodation: { icon: "🏨", color: "text-green-700", bgColor: "bg-green-50" },
      shopping: { icon: "🛍️", color: "text-pink-700", bgColor: "bg-pink-50" },
      entertainment: { icon: "🎭", color: "text-indigo-700", bgColor: "bg-indigo-50" },
      nature: { icon: "🌿", color: "text-emerald-700", bgColor: "bg-emerald-50" },
      culture: { icon: "🎨", color: "text-violet-700", bgColor: "bg-violet-50" },
      adventure: { icon: "🏔️", color: "text-red-700", bgColor: "bg-red-50" },
      relaxation: { icon: "🧘", color: "text-cyan-700", bgColor: "bg-cyan-50" },
    };
    return configs[category.toLowerCase()] || { icon: "📍", color: "text-gray-700", bgColor: "bg-gray-50" };
  };

  const getDaysCount = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              ← Back
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{trip.title}</h1>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <span className="text-xl font-semibold">{trip.destination}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {trip.status === "planning" && (
                <button
                  onClick={() => handleStatusChange("confirmed")}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-semibold shadow-lg"
                >
                  ✅ Confirm Trip
                </button>
              )}
              {trip.status === "confirmed" && (
                <button
                  onClick={() => handleStatusChange("completed")}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-semibold shadow-lg"
                >
                  🏁 Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm font-medium">Duration</div>
              <div className="text-2xl font-bold">
                {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''}
              </div>
              <div className="text-white/60 text-xs">
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm font-medium">Travelers</div>
              <div className="text-2xl font-bold">{trip.travelers}</div>
              <div className="text-white/60 text-xs">
                {trip.travelers === 1 ? 'Solo adventure' : 'Group trip'}
              </div>
            </div>
            
            {trip.budget && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-white/80 text-sm font-medium">Budget</div>
                <div className="text-2xl font-bold">${trip.budget.toLocaleString()}</div>
                <div className="text-white/60 text-xs">
                  ~${Math.round(trip.budget / getDaysCount())} per day
                </div>
              </div>
            )}
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-white/80 text-sm font-medium">Status</div>
              <div className="text-2xl font-bold capitalize">{trip.status}</div>
              <div className="text-white/60 text-xs">
                {trip.status === 'planning' && 'Ready to confirm'}
                {trip.status === 'confirmed' && 'All set to go!'}
                {trip.status === 'completed' && 'Great memories!'}
              </div>
            </div>
          </div>

          {/* Description and Preferences */}
          <div className="mt-6 space-y-4">
            {trip.description && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-white/80 text-sm font-medium mb-2">Trip Description</div>
                <p className="text-white leading-relaxed">{trip.description}</p>
              </div>
            )}

            {trip.preferences && trip.preferences.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-white/80 text-sm font-medium mb-3">Your Interests</div>
                <div className="flex flex-wrap gap-2">
                  {trip.preferences.map((pref) => (
                    <span
                      key={pref}
                      className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium backdrop-blur-sm"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Itinerary Section */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Itinerary</h2>
              <p className="text-gray-600">Crafted by AI based on your preferences</p>
            </div>
            {itinerary.length > 0 && (
              <button
                onClick={handleRegenerateItinerary}
                disabled={isRegenerating}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-lg disabled:opacity-50"
              >
                {isRegenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Regenerating...
                  </div>
                ) : (
                  "🔄 Regenerate"
                )}
              </button>
            )}
          </div>
          
          {itinerary.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is crafting your perfect itinerary...</h3>
              <p className="text-gray-600">This usually takes 30-60 seconds. We're analyzing your preferences and creating something amazing!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {itinerary.map((day) => (
                <div key={day._id} className="relative">
                  {/* Day Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Day {day.day}</h3>
                      {day.theme && (
                        <p className="text-indigo-600 font-semibold">{day.theme}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Activities */}
                  <div className="ml-6 border-l-4 border-indigo-200 pl-8 space-y-6">
                    {day.activities.map((activity, index) => {
                      const categoryConfig = getCategoryConfig(activity.category);
                      return (
                        <div key={index} className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all">
                          {/* Time indicator */}
                          <div className="absolute -left-14 top-6 w-6 h-6 bg-white border-4 border-indigo-500 rounded-full shadow-lg"></div>
                          
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 ${categoryConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <span className="text-2xl">{categoryConfig.icon}</span>
                            </div>
                            
                            <div className="flex-1">
                              {/* Activity header */}
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <span className="text-lg font-bold text-indigo-600">
                                  {activity.time}
                                </span>
                                {activity.duration && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                    ⏱️ {activity.duration}
                                  </span>
                                )}
                                {activity.cost && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                                    💰 ${activity.cost}
                                  </span>
                                )}
                                <span className={`px-2 py-1 ${categoryConfig.bgColor} ${categoryConfig.color} text-sm rounded-full font-medium capitalize`}>
                                  {activity.category}
                                </span>
                              </div>
                              
                              {/* Activity content */}
                              <h4 className="text-xl font-bold text-gray-900 mb-2">
                                {activity.title}
                              </h4>
                              <p className="text-gray-700 leading-relaxed mb-3">
                                {activity.description}
                              </p>
                              
                              {/* Location and tips */}
                              <div className="space-y-2">
                                {activity.location && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <span className="text-sm">📍</span>
                                    <span className="text-sm font-medium">{activity.location}</span>
                                  </div>
                                )}
                                {activity.tips && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                    <div className="flex items-start gap-2">
                                      <span className="text-yellow-600">💡</span>
                                      <p className="text-sm text-yellow-800 font-medium">{activity.tips}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Day notes */}
                  {day.notes && (
                    <div className="ml-6 mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="flex items-start gap-2">
                        <span className="text-indigo-600">📝</span>
                        <p className="text-sm text-indigo-800 font-medium">{day.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
