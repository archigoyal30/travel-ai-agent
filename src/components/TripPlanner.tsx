import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface TripPlannerProps {
  onBack: () => void;
}

export function TripPlanner({ onBack }: TripPlannerProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelers: 1,
    preferences: [] as string[],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createTrip = useMutation(api.trips.createTrip);
  const searchResults = useQuery(api.trips.searchDestinations, { query: searchQuery });

  const preferenceOptions = [
    { name: "Adventure", icon: "🏔️", color: "from-orange-500 to-red-500" },
    { name: "Culture", icon: "🎭", color: "from-purple-500 to-indigo-500" },
    { name: "Food", icon: "🍽️", color: "from-yellow-500 to-orange-500" },
    { name: "History", icon: "🏛️", color: "from-amber-500 to-yellow-500" },
    { name: "Nature", icon: "🌿", color: "from-green-500 to-emerald-500" },
    { name: "Relaxation", icon: "🧘", color: "from-blue-500 to-cyan-500" },
    { name: "Shopping", icon: "🛍️", color: "from-pink-500 to-rose-500" },
    { name: "Nightlife", icon: "🌃", color: "from-violet-500 to-purple-500" },
    { name: "Art", icon: "🎨", color: "from-indigo-500 to-blue-500" },
    { name: "Architecture", icon: "🏗️", color: "from-gray-500 to-slate-500" },
    { name: "Beach", icon: "🏖️", color: "from-cyan-500 to-blue-500" },
    { name: "Mountains", icon: "⛰️", color: "from-slate-500 to-gray-500" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (startDate < new Date()) {
      toast.error("Start date cannot be in the past");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTrip({
        title: formData.title,
        description: formData.description || undefined,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        travelers: formData.travelers,
        preferences: formData.preferences.length > 0 ? formData.preferences : undefined,
      });
      
      toast.success("🎉 Trip created! Our AI is crafting your perfect itinerary...", {
        duration: 4000,
      });
      onBack();
    } catch (error) {
      toast.error("Failed to create trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const selectDestination = (destination: string) => {
    setFormData(prev => ({ ...prev, destination }));
    setSearchQuery(destination);
    setShowDestinations(false);
  };

  const getDaysCount = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : 0;
    }
    return 0;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-3xl font-bold">Plan New Adventure</h2>
              <p className="text-white/80 mt-1">Let our AI create the perfect itinerary for you</p>
            </div>
          </div>
          
          {getDaysCount() > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <span className="font-semibold">
                  {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''} of adventure awaits!
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Trip Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Trip Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
              placeholder="e.g., Magical Summer in Paris ✨"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tell us about your dream trip
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
              rows={3}
              placeholder="Share your travel goals, special occasions, or any specific requirements..."
            />
          </div>

          {/* Destination Search */}
          <div className="relative space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Destination *
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDestinations(true);
                }}
                onFocus={() => setShowDestinations(true)}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
                placeholder="🌍 Where would you like to go?"
              />
              
              {showDestinations && searchResults && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {searchResults.map((dest) => (
                    <button
                      key={dest._id}
                      type="button"
                      onClick={() => selectDestination(dest.name)}
                      className="w-full px-4 py-4 text-left hover:bg-indigo-50/50 border-b border-gray-100/50 last:border-b-0 transition-colors"
                    >
                      <div className="font-semibold text-gray-900">{dest.name}</div>
                      <div className="text-sm text-gray-600">{dest.country}</div>
                      <div className="text-xs text-gray-500 mt-1">{dest.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Budget and Travelers */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full pl-8 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Total budget (optional)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Number of Travelers
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.travelers}
                onChange={(e) => setFormData(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              What interests you most? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {preferenceOptions.map((pref) => (
                <button
                  key={pref.name}
                  type="button"
                  onClick={() => togglePreference(pref.name)}
                  className={`group relative p-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    formData.preferences.includes(pref.name)
                      ? `bg-gradient-to-r ${pref.color} text-white shadow-lg transform scale-105`
                      : "bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/70 border border-white/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{pref.icon}</span>
                    <span>{pref.name}</span>
                  </div>
                  {formData.preferences.includes(pref.name) && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-4 bg-white/50 backdrop-blur-sm border border-white/50 text-gray-700 rounded-xl hover:bg-white/70 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Magic...
                </div>
              ) : (
                "✨ Create My Trip"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
