import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TripCard } from "./TripCard";
import { TripDetail } from "./TripDetail";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

interface TripListProps {
  onCreateTrip: () => void;
}

export function TripList({ onCreateTrip }: TripListProps) {
  const trips = useQuery(api.trips.getUserTrips);
  const [selectedTripId, setSelectedTripId] = useState<Id<"trips"> | null>(null);
  const seedDestinations = useMutation(api.destinations.seedDestinations);

  // Seed destinations on first load
  useState(() => {
    seedDestinations().catch(console.error);
  });

  if (trips === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (selectedTripId) {
    return (
      <TripDetail
        tripId={selectedTripId}
        onBack={() => setSelectedTripId(null)}
      />
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <span className="text-6xl">✈️</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
        </div>
        
        <h3 className="text-3xl font-bold text-gray-900 mb-4">Your adventure awaits!</h3>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Ready to explore the world? Let our AI create the perfect itinerary for your next journey.
        </p>
        
        <button
          onClick={onCreateTrip}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:scale-105"
        >
          ✨ Plan Your First Trip
        </button>
      </div>
    );
  }

  const planningTrips = trips.filter(trip => trip.status === "planning");
  const confirmedTrips = trips.filter(trip => trip.status === "confirmed");
  const completedTrips = trips.filter(trip => trip.status === "completed");

  return (
    <div className="space-y-12">
      {planningTrips.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Planning</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
              {planningTrips.length} trip{planningTrips.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onClick={() => setSelectedTripId(trip._id)}
              />
            ))}
          </div>
        </section>
      )}

      {confirmedTrips.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Adventures</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              {confirmedTrips.length} trip{confirmedTrips.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {confirmedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onClick={() => setSelectedTripId(trip._id)}
              />
            ))}
          </div>
        </section>
      )}

      {completedTrips.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-slate-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏁</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Completed Journeys</h2>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full font-medium">
              {completedTrips.length} trip{completedTrips.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onClick={() => setSelectedTripId(trip._id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
