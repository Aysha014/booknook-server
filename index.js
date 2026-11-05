import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    return client.db("booknook");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("BookNook API is running!");
});

async function startServer() {
  await connectToMongoDB();

  app.listen(port, () => {
    console.log(`BookNook server running on port ${port}`);
  });
}

startServer();