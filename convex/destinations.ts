import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedDestinations = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if destinations already exist
    const existing = await ctx.db.query("destinations").first();
    if (existing) {
      return "Destinations already seeded";
    }

    const destinations = [
      {
        name: "Paris",
        country: "France",
        description: "The City of Light, famous for its art, fashion, gastronomy, and culture.",
        popularAttractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Arc de Triomphe", "Champs-Élysées"],
        bestTimeToVisit: "April to June, September to October",
        averageBudget: { budget: 100, luxury: 300, midRange: 180 },
        tags: ["romantic", "culture", "art", "fashion", "cuisine"],
      },
      {
        name: "Tokyo",
        country: "Japan",
        description: "A bustling metropolis blending traditional culture with cutting-edge technology.",
        popularAttractions: ["Senso-ji Temple", "Tokyo Skytree", "Shibuya Crossing", "Meiji Shrine", "Tsukiji Fish Market"],
        bestTimeToVisit: "March to May, September to November",
        averageBudget: { budget: 120, luxury: 400, midRange: 220 },
        tags: ["technology", "culture", "food", "temples", "modern"],
      },
      {
        name: "New York City",
        country: "United States",
        description: "The Big Apple, a global hub for finance, arts, fashion, and culture.",
        popularAttractions: ["Statue of Liberty", "Central Park", "Times Square", "Empire State Building", "Brooklyn Bridge"],
        bestTimeToVisit: "April to June, September to November",
        averageBudget: { budget: 150, luxury: 500, midRange: 280 },
        tags: ["urban", "culture", "shopping", "broadway", "museums"],
      },
      {
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise known for its beaches, temples, and vibrant culture.",
        popularAttractions: ["Tanah Lot Temple", "Ubud Rice Terraces", "Mount Batur", "Seminyak Beach", "Sacred Monkey Forest"],
        bestTimeToVisit: "April to October",
        averageBudget: { budget: 50, luxury: 200, midRange: 100 },
        tags: ["beach", "temples", "nature", "relaxation", "tropical"],
      },
      {
        name: "Rome",
        country: "Italy",
        description: "The Eternal City, rich in history, art, and culinary traditions.",
        popularAttractions: ["Colosseum", "Vatican City", "Trevi Fountain", "Roman Forum", "Pantheon"],
        bestTimeToVisit: "April to June, September to October",
        averageBudget: { budget: 80, luxury: 250, midRange: 150 },
        tags: ["history", "art", "cuisine", "ancient", "culture"],
      },
      {
        name: "London",
        country: "United Kingdom",
        description: "A historic city blending royal heritage with modern innovation.",
        popularAttractions: ["Big Ben", "Tower of London", "British Museum", "London Eye", "Buckingham Palace"],
        bestTimeToVisit: "May to September",
        averageBudget: { budget: 120, luxury: 350, midRange: 200 },
        tags: ["history", "royal", "museums", "culture", "parks"],
      },
    ];

    for (const destination of destinations) {
      await ctx.db.insert("destinations", destination);
    }

    return "Destinations seeded successfully";
  },
});
