import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Equipment from "../models/Equipment.js";
import MandiPool from "../models/Mandipool.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Dispute from "../models/Dispute.js";
import connectDB from "../config/db.js";

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for data enhancement...");

    const hashedPassword = await bcrypt.hash("kisan1234", 10);

    // 1. Ensure Verified Farmers and Admin exist
    const usersData = [
      {
        name: "Admin KrishiPool",
        email: "admin@krishipool.in",
        phone: "+91 98000 00001",
        password: hashedPassword,
        village: "Krishi Bhawan",
        region: "Central",
        role: "admin",
        trustScore: 10,
        verified: true,
        isActive: true,
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
      },
      {
        name: "Ramesh Patel",
        email: "ramesh.patel@kisan.in",
        phone: "+91 98260 12345",
        password: hashedPassword,
        village: "Bhopal",
        region: "Madhya Pradesh",
        role: "farmer",
        trustScore: 9.6,
        verified: true,
        isActive: true,
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop",
      },
      {
        name: "Gurpreet Singh",
        email: "gurpreet.singh@kisan.in",
        phone: "+91 98140 23456",
        village: "Khanna",
        region: "Punjab",
        role: "farmer",
        trustScore: 9.8,
        verified: true,
        isActive: true,
        password: hashedPassword,
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
      },
      {
        name: "Devendra Choudhary",
        email: "devendra.c@kisan.in",
        phone: "+91 98930 45678",
        password: hashedPassword,
        village: "Sehore",
        region: "Madhya Pradesh",
        role: "farmer",
        trustScore: 9.5,
        verified: true,
        isActive: true,
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
      },
      {
        name: "Suresh Deshmukh",
        email: "suresh.deshmukh@kisan.in",
        phone: "+91 94220 34567",
        password: hashedPassword,
        village: "Lasalgaon",
        region: "Maharashtra",
        role: "farmer",
        trustScore: 9.4,
        verified: true,
        isActive: true,
        profileImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop",
      },
    ];

    const usersMap = {};
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`Created user: ${u.name}`);
      } else {
        await User.findByIdAndUpdate(existing._id, { ...u, password: existing.password });
      }
      usersMap[u.email] = existing;
    }

    // 2. Realistic Equipment Data
    const equipmentData = [
      {
        ownerId: usersMap["ramesh.patel@kisan.in"]._id,
        name: "Mahindra 575 DI Sarpanch Tractor",
        type: "Tractor (45 HP)",
        rentalRatePerDay: 1200,
        location: "Bhopal",
        condition: "Good",
        isBooked: false,
        equipmentImage: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=600&auto=format&fit=crop",
      },
      {
        ownerId: usersMap["devendra.c@kisan.in"]._id,
        name: "John Deere 5050 D 4WD Heavy Tractor",
        type: "Tractor (50 HP)",
        rentalRatePerDay: 1800,
        location: "Sehore",
        condition: "Good",
        isBooked: false,
        equipmentImage: "https://images.unsplash.com/photo-1544085311-11a028465b03?w=600&auto=format&fit=crop",
      },
      {
        ownerId: usersMap["ramesh.patel@kisan.in"]._id,
        name: "Shaktiman High-Speed Rotary Tiller",
        type: "Rotavator (7 ft)",
        rentalRatePerDay: 900,
        location: "Ratibad",
        condition: "Good",
        isBooked: true,
        equipmentImage: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop",
      },
      {
        ownerId: usersMap["gurpreet.singh@kisan.in"]._id,
        name: "Preet 987 Multi-Crop Combine Harvester",
        type: "Combine Harvester",
        rentalRatePerDay: 4500,
        location: "Khanna",
        condition: "Good",
        isBooked: false,
        equipmentImage: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600&auto=format&fit=crop",
      },
      {
        ownerId: usersMap["devendra.c@kisan.in"]._id,
        name: "Garuda Kisan Agri Spraying Drone (16L)",
        type: "Drone Sprayer",
        rentalRatePerDay: 1500,
        location: "Indore",
        condition: "Good",
        isBooked: false,
        equipmentImage: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop",
      },
      {
        ownerId: usersMap["suresh.deshmukh@kisan.in"]._id,
        name: "Fieldking Automatic Seed & Fertilizer Drill",
        type: "Seed Drill",
        rentalRatePerDay: 750,
        location: "Lasalgaon",
        condition: "Good",
        isBooked: false,
        equipmentImage: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop",
      },
    ];

    // Remove legacy gibberish equipment
    await Equipment.deleteMany({ name: { $in: ["ryctvubino", "tuk", "xtcfvgbh", "cyvghjb", "xcfvgbhjk"] } });

    for (const eq of equipmentData) {
      const exists = await Equipment.findOne({ name: eq.name });
      if (!exists) {
        await Equipment.create(eq);
        console.log(`Created equipment: ${eq.name}`);
      } else {
        await Equipment.findByIdAndUpdate(exists._id, eq);
      }
    }

    // 3. Realistic Mandi Pools with GPS
    const mandiData = [
      {
        ownerId: usersMap["gurpreet.singh@kisan.in"]._id,
        mandiDate: new Date(Date.now() + 2 * 86400000),
        mandiLocation: "Khanna APMC Grain Mandi, Punjab",
        driverName: "Balwinder Singh",
        driverPhone: "+91 98765 11223",
        truckCapacity: 120,
        totalWeight: 85,
        status: "Pending",
        driverLocation: {
          lat: 30.7024,
          lng: 76.2195,
          updatedAt: new Date(),
        },
        farmersJoined: [
          {
            farmerId: usersMap["gurpreet.singh@kisan.in"]._id,
            cropType: "Sharbati Wheat",
            cropWeight: 50,
            shareCost: 1200,
          },
        ],
      },
      {
        ownerId: usersMap["suresh.deshmukh@kisan.in"]._id,
        mandiDate: new Date(Date.now() + 1 * 86400000),
        mandiLocation: "Lasalgaon APMC Onion Market, Maharashtra",
        driverName: "Eknath Shinde",
        driverPhone: "+91 98221 44556",
        truckCapacity: 90,
        totalWeight: 65,
        status: "onTrip",
        driverLocation: {
          lat: 20.1477,
          lng: 74.2259,
          updatedAt: new Date(),
        },
        farmersJoined: [
          {
            farmerId: usersMap["suresh.deshmukh@kisan.in"]._id,
            cropType: "Nashik Red Onion",
            cropWeight: 45,
            shareCost: 950,
          },
        ],
      },
      {
        ownerId: usersMap["ramesh.patel@kisan.in"]._id,
        mandiDate: new Date(Date.now() + 3 * 86400000),
        mandiLocation: "Bhopal Krishi Upaj Mandi (Karond), MP",
        driverName: "Mohan Yadav",
        driverPhone: "+91 98931 77889",
        truckCapacity: 100,
        totalWeight: 70,
        status: "Confirmed",
        driverLocation: {
          lat: 23.2842,
          lng: 77.4089,
          updatedAt: new Date(),
        },
        farmersJoined: [
          {
            farmerId: usersMap["ramesh.patel@kisan.in"]._id,
            cropType: "Chana & Mustard",
            cropWeight: 40,
            shareCost: 850,
          },
          {
            farmerId: usersMap["devendra.c@kisan.in"]._id,
            cropType: "Soybean",
            cropWeight: 30,
            shareCost: 650,
          },
        ],
      },
    ];

    for (const m of mandiData) {
      const exists = await MandiPool.findOne({ mandiLocation: m.mandiLocation });
      if (!exists) {
        await MandiPool.create(m);
        console.log(`Created Mandi Pool: ${m.mandiLocation}`);
      } else {
        await MandiPool.findByIdAndUpdate(exists._id, m);
      }
    }

    // 4. Ensure payments and bookings have proper references
    const allEq = await Equipment.find();
    if (allEq.length > 0) {
      const existingBookings = await Booking.find();
      if (existingBookings.length === 0) {
        await Booking.create({
          equipmentId: allEq[0]._id,
          renterId: usersMap["devendra.c@kisan.in"]._id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 3 * 86400000),
          totalAmount: 3600,
          status: "confirmed",
        });
      }
    }

    console.log("Database seeded successfully with authentic production data!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
