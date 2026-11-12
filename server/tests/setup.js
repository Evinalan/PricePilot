const os = require("os");
require("dotenv").config();

process.env.JWT_SECRET = "pricepilot-test-secret";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

jest.setTimeout(30000);

beforeAll(async () => {
  try {
    console.log("Starting MongoDB Memory Server...");

    mongoServer = await MongoMemoryServer.create();

    const mongoUri = mongoServer.getUri();

    console.log("MongoDB URI:", mongoUri);
    console.log("Connecting Mongoose...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      runtimeAdapters: {
        os: os,
      },
    });

    console.log("Test MongoDB connected successfully!");

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;

    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log("Test MongoDB disconnected.");

  } catch (error) {
    console.error("Cleanup error:", error);
  }
});
