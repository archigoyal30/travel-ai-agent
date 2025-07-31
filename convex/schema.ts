import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  trips: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    destination: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budget: v.optional(v.number()),
    travelers: v.number(),
    preferences: v.optional(v.array(v.string())),
    userId: v.id("users"),
    status: v.union(v.literal("planning"), v.literal("confirmed"), v.literal("completed")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  itineraries: defineTable({
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
      category: v.string(), // sightseeing, food, transport, accommodation, etc.
      tips: v.optional(v.string()),
    })),
    notes: v.optional(v.string()),
  })
    .index("by_trip", ["tripId"])
    .index("by_trip_and_day", ["tripId", "day"]),

  destinations: defineTable({
    name: v.string(),
    country: v.string(),
    description: v.string(),
    popularAttractions: v.array(v.string()),
    bestTimeToVisit: v.string(),
    averageBudget: v.object({
      budget: v.number(),
      luxury: v.number(),
      midRange: v.number(),
    }),
    tags: v.array(v.string()),
  })
    .index("by_country", ["country"])
    .searchIndex("search_destinations", {
      searchField: "name",
      filterFields: ["country"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
