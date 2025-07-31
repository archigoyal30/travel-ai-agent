import { v } from "convex/values";
import { query, mutation, action, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const createTrip = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.optional(v.number()),
    travelers: v.number(),
    preferences: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a trip");
    }

    const tripId = await ctx.db.insert("trips", {
      ...args,
      userId,
      status: "planning",
    });

    // Schedule AI itinerary generation
    await ctx.scheduler.runAfter(0, internal.trips.generateItinerary, {
      tripId,
    });

    return tripId;
  },
});

export const getUserTrips = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) {
      throw new Error("Trip not found or access denied");
    }

    return trip;
  },
});

export const getTripItinerary = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) {
      throw new Error("Trip not found or access denied");
    }

    return await ctx.db
      .query("itineraries")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .collect();
  },
});

export const updateTripStatus = mutation({
  args: {
    tripId: v.id("trips"),
    status: v.union(v.literal("planning"), v.literal("confirmed"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) {
      throw new Error("Trip not found or access denied");
    }

    await ctx.db.patch(args.tripId, { status: args.status });
  },
});

export const generateItinerary = internalAction({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.runQuery(internal.trips.getTripForGeneration, {
      tripId: args.tripId,
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Enhanced AI prompt for better itinerary generation
    const budgetInfo = trip.budget 
      ? `Budget: $${trip.budget} total (approximately $${Math.round(trip.budget / days)} per day)`
      : "Budget: Flexible (provide options for different price ranges)";

    const preferencesInfo = trip.preferences && trip.preferences.length > 0
      ? `Travel preferences: ${trip.preferences.join(", ")}. Please prioritize activities that align with these interests.`
      : "No specific preferences mentioned - provide a well-rounded experience.";

    const prompt = `You are an expert travel planner. Create a detailed, realistic ${days}-day travel itinerary for ${trip.destination}.

TRIP DETAILS:
- Destination: ${trip.destination}
- Duration: ${days} days (${trip.startDate} to ${trip.endDate})
- Number of travelers: ${trip.travelers}
- ${budgetInfo}
- ${preferencesInfo}
- Additional notes: ${trip.description || "None"}

REQUIREMENTS:
1. Create a practical day-by-day schedule with realistic timing
2. Include a mix of must-see attractions, local experiences, and downtime
3. Consider travel time between locations
4. Provide specific locations with addresses when possible
5. Include meal recommendations that fit the budget and preferences
6. Add cultural insights and local tips
7. Balance popular attractions with hidden gems
8. Consider the group size for activity recommendations

For each day, provide 4-8 activities with:
- Realistic time slots (consider opening hours, travel time, meal times)
- Detailed descriptions that explain WHY this activity is recommended
- Specific locations with neighborhood/district information
- Estimated duration and costs
- Practical tips (booking requirements, best times to visit, etc.)

RESPONSE FORMAT:
Return a JSON array where each element represents a day:

[
  {
    "day": 1,
    "theme": "Arrival & City Center Exploration",
    "activities": [
      {
        "time": "10:00",
        "title": "Activity Name",
        "description": "Detailed description explaining what to expect, why it's special, and practical tips",
        "location": "Specific address or landmark, District/Neighborhood",
        "duration": "2 hours",
        "cost": 25,
        "category": "sightseeing",
        "tips": "Practical advice like 'book in advance' or 'best photo spots'"
      }
    ]
  }
]

Categories to use: sightseeing, food, transport, accommodation, shopping, entertainment, nature, culture, adventure, relaxation

Make this itinerary memorable, practical, and perfectly tailored to the traveler's needs!`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      // Clean the response to extract JSON
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const itineraryData = JSON.parse(jsonString);
      
      // Save each day's itinerary
      for (const dayData of itineraryData) {
        await ctx.runMutation(internal.trips.saveItineraryDay, {
          tripId: args.tripId,
          day: dayData.day,
          theme: dayData.theme || `Day ${dayData.day}`,
          activities: dayData.activities,
        });
      }
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.error("AI Response:", content);
      throw new Error("Failed to generate itinerary - please try again");
    }
  },
});

export const getTripForGeneration = internalQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

export const saveItineraryDay = internalMutation({
  args: {
    tripId: v.id("trips"),
    day: v.number(),
    theme: v.optional(v.string()),
    activities: v.array(v.object({
      time: v.string(),
      title: v.string(),
      description: v.string(),
      location: v.optional(v.string()),
      duration: v.optional(v.string()),
      cost: v.optional(v.number()),
      category: v.string(),
      tips: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("itineraries", {
      tripId: args.tripId,
      day: args.day,
      theme: args.theme,
      activities: args.activities,
    });
  },
});

export const searchDestinations = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (args.query.length < 2) {
      return [];
    }

    return await ctx.db
      .query("destinations")
      .withSearchIndex("search_destinations", (q) =>
        q.search("name", args.query)
      )
      .take(10);
  },
});

export const regenerateItinerary = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== userId) {
      throw new Error("Trip not found or access denied");
    }

    // Delete existing itinerary
    const existingItinerary = await ctx.db
      .query("itineraries")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    for (const day of existingItinerary) {
      await ctx.db.delete(day._id);
    }

    // Schedule new AI generation
    await ctx.scheduler.runAfter(0, internal.trips.generateItinerary, {
      tripId: args.tripId,
    });

    return "Regenerating itinerary...";
  },
});
