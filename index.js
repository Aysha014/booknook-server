
import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);

let db;
let dbPromise;

async function connectToMongoDB() {
  if (!dbPromise) {
    dbPromise = client
      .connect()
      .then(() => {
        console.log("Connected to MongoDB");
        db = client.db("booknook");
        return db;
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }

  return dbPromise;
}

// Root route
app.get("/", (req, res) => {
  res.send("BookNook API is running!");
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
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

// API 2: Get a single book by ID (Public)
app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      ...book,
      id: book._id.toString(),
    });
  } catch (error) {
    console.error("Error fetching book:", error);

    res.status(500).json({
      message: "Failed to fetch book",
    });
  }
});

// API 3: Add a new book
app.post("/books", async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      image,
      description,
      addedByName,
      addedByEmail,
      addedAt,
      totalCopies,
      availableCopies,
    } = req.body;

    if (
      !title ||
      !author ||
      !category ||
      !image ||
      !description ||
      !addedByName ||
      !addedByEmail
    ) {
      return res.status(400).json({
        message: "Please provide all required book details.",
      });
    }

    if (
      !Number.isInteger(totalCopies) ||
      totalCopies < 1 ||
      !Number.isInteger(availableCopies) ||
      availableCopies < 1 ||
      availableCopies > totalCopies
    ) {
      return res.status(400).json({
        message: "Invalid book copy information.",
      });
    }

    const newBook = {
      title: title.trim(),
      author: author.trim(),
      category,
      image: image.trim(),
      description: description.trim(),
      addedByName,
      addedByEmail,
      addedAt,
      totalCopies,
      availableCopies,
    };

    const result = await db.collection("books").insertOne(newBook);

    res.status(201).json({
      message: "Book added successfully",
      book: {
        ...newBook,
        id: result.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Error adding book:", error);

    res.status(500).json({
      message: "Failed to add book",
    });
  }
});

// Local development server
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`BookNook server running on port ${port}`);
  });
}

// Export Express app for Vercel
export default app;
