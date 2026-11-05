
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

let db;

export async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("booknook");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

// Root route
app.get("/", (req, res) => {
  res.send("BookNook API is running!");
});

// API 1: Get all books (Public)
app.get("/books", async (req, res) => {
  try {
    const books = await db
      .collection("books")
      .find()
      .map((book) => ({
        ...book,
        id: book._id.toString(),
      }))
      .toArray();

    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();

  app.listen(port, () => {
    console.log(`BookNook server running on port ${port}`);
  });
}

startServer();
