import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// --- Types ---
export interface Business {
  id: string;
  ownerName: string;
  businessName: string;
  skillArea: string;
  location: string;
  productCategory: string; // Food, Craft, Textile, Other
  description: string;
  dailyCapacity: number;
  capacityUnit: string; // units/day, kg/day, dozen/day
  bulkPrice: string;
  phoneNumber: string;
  imageUrl: string;
  isAvailable: boolean;
  weeklyCapacity: number;
  ownerId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

// --- Initial Data ---
let businesses: Business[] = [
  {
    id: "1",
    ownerName: "Sarah J.",
    businessName: "Green Basket Weavers",
    skillArea: "Traditional Weaving",
    location: "Mysuru, KA",
    productCategory: "Craft",
    description: "Eco-friendly bamboo and jute baskets made with zero waste.",
    dailyCapacity: 50,
    capacityUnit: "units/day",
    bulkPrice: "₹120/piece",
    phoneNumber: "+919876543210",
    imageUrl: "https://images.unsplash.com/photo-1590422443890-2a39620b8525?auto=format&fit=crop&q=80&w=800",
    isAvailable: true,
    weeklyCapacity: 300,
    ownerId: "user1"
  },
  {
    id: "2",
    ownerName: "Arun K.",
    businessName: "Pure Agarbatti Rolls",
    skillArea: "Incence Making",
    location: "Tumkur, KA",
    productCategory: "Other",
    description: "Sandalwood and Rose scented agarbattis rolled by hand.",
    dailyCapacity: 500,
    capacityUnit: "packs/day",
    bulkPrice: "₹45/pack",
    phoneNumber: "+919876543211",
    imageUrl: "https://images.unsplash.com/photo-1621274403997-37aae1836a04?auto=format&fit=crop&q=80&w=800",
    isAvailable: false,
    weeklyCapacity: 2500,
    ownerId: "user2"
  },
  {
    id: "3",
    ownerName: "Lakshmi",
    businessName: "Crispy Papad Hub",
    skillArea: "Food Processing",
    location: "Hubballi, KA",
    productCategory: "Food",
    description: "Sun-dried urad dal papads with authentic spicy mix.",
    dailyCapacity: 2000,
    capacityUnit: "packs/day",
    bulkPrice: "₹25/pack",
    phoneNumber: "+919876543212",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
    isAvailable: true,
    weeklyCapacity: 12000,
    ownerId: "user3"
  }
];

let users: User[] = [
  { id: "user1", email: "sarah@example.com", name: "Sarah J." }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Auth (Simplified for demo)
  app.post("/api/login", (req, res) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email);
    if (user) {
      res.json(user);
    } else {
      // Auto-register for demo purposes if not found
      const newUser = { id: `user_${Date.now()}`, email, name: email.split('@')[0] };
      users.push(newUser);
      res.json(newUser);
    }
  });

  // Get all businesses
  app.get("/api/businesses", (req, res) => {
    res.json(businesses);
  });

  // Get business by ID
  app.get("/api/businesses/:id", (req, res) => {
    const business = businesses.find(b => b.id === req.params.id);
    if (business) res.json(business);
    else res.status(404).json({ error: "Not found" });
  });

  // Add Business
  app.post("/api/businesses", (req, res) => {
    const newBusiness: Business = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
    };
    businesses.push(newBusiness);
    res.status(201).json(newBusiness);
  });

  // Update Capacity
  app.patch("/api/businesses/:id/capacity", (req, res) => {
    const { isAvailable, weeklyCapacity } = req.body;
    const index = businesses.findIndex(b => b.id === req.params.id);
    if (index !== -1) {
      businesses[index] = { ...businesses[index], isAvailable, weeklyCapacity };
      res.json(businesses[index]);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // --- Vite / Production Setup ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
