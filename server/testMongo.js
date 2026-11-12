const { MongoMemoryServer } = require("mongodb-memory-server");

async function testMongo() {
  let mongoServer;

  try {
    console.log("Starting temporary MongoDB...");

    mongoServer = await MongoMemoryServer.create();

    console.log("MongoDB started successfully!");

    console.log("Connection URL:", mongoServer.getUri());

  } catch (error) {
    console.error("MongoDB startup error:", error);

  } finally {
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

testMongo();