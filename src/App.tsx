import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { TripPlanner } from "./components/TripPlanner";
import { TripList } from "./components/TripList";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <header className="relative z-10 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">✈</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                TravelAI
              </h1>
              <p className="text-xs text-gray-500 font-medium">Powered by AI</p>
            </div>
          </div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <Content />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentView, setCurrentView] = useState<"list" | "create">("list");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Unauthenticated>
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-200/50 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-indigo-700">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
              Plan Your Perfect
              <br />
              <span className="relative">
                Adventure
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30"></div>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the future of travel planning with our AI assistant that creates 
              <span className="font-semibold text-indigo-600"> personalized itineraries</span> tailored just for you
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">AI-Powered Intelligence</h3>
                  <p className="text-gray-600 leading-relaxed">Advanced AI analyzes your preferences, budget, and travel style to create the perfect itinerary</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Detailed Itineraries</h3>
                  <p className="text-gray-600 leading-relaxed">Day-by-day plans with precise timing, local insights, and hidden gems you won't find elsewhere</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                    <span className="text-3xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Smart Budget Planning</h3>
                  <p className="text-gray-600 leading-relaxed">Optimized recommendations that maximize your experience while staying within your budget</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 max-w-md mx-auto">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Welcome back!</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Hello, {loggedInUser?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-xl text-gray-600">Ready to plan your next incredible adventure?</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView("list")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentView === "list"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-white/50"
                }`}
              >
                My Trips
              </button>
              <button
                onClick={() => setCurrentView("create")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentView === "create"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white/90 border border-white/50"
                }`}
              >
                ✨ Plan New Trip
              </button>
            </div>
          </div>
        </div>

        {currentView === "list" ? (
          <TripList onCreateTrip={() => setCurrentView("create")} />
        ) : (
          <TripPlanner onBack={() => setCurrentView("list")} />
        )}
      </Authenticated>
    </div>
  );
}
