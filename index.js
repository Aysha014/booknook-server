
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
    const limit = Number(req.query.limit);

    let query = db
      .collection("books")
      .find()
      .sort({ addedAt: -1 });

    // Apply limit only when a valid limit is requested
    if (Number.isInteger(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const books = await query.toArray();

    res.status(200).json(
      books.map((book) => ({
        ...book,
        id: book._id.toString(),
      }))
    );
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


// API 4: Update a book
app.patch("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const {
      title,
      author,
      category,
      image,
      description,
      totalCopies,
      availableCopies,
    } = req.body;

    if (
      !title?.trim() ||
      !author?.trim() ||
      !category ||
      !image?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required book details.",
      });
    }

    if (
      !Number.isInteger(totalCopies) ||
      totalCopies < 1 ||
      !Number.isInteger(availableCopies) ||
      availableCopies < 0 ||
      availableCopies > totalCopies
    ) {
      return res.status(400).json({
        message: "Invalid book copy information.",
      });
    }

    const result = await db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: title.trim(),
          author: author.trim(),
          category,
          image: image.trim(),
          description: description.trim(),
          totalCopies,
          availableCopies,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book updated successfully",
    });
  } catch (error) {
    console.error("Error updating book:", error);

    res.status(500).json({
      message: "Failed to update book",
    });
  }
});


// API 5: Delete a book
app.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const result = await db.collection("books").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);

    res.status(500).json({
      message: "Failed to delete book",
    });
  }
});





// API 6: Borrow a book
app.post("/borrows", async (req, res) => {
  try {
    const { bookId, userEmail } = req.body;

    if (!bookId || !userEmail) {
      return res.status(400).json({
        message: "Book ID and user email are required.",
      });
    }

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID.",
      });
    }

    const booksCollection = db.collection("books");
    const borrowsCollection = db.collection("borrows");

    const book = await booksCollection.findOne({
      _id: new ObjectId(bookId),
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found.",
      });
    }

    const existingBorrow = await borrowsCollection.findOne({
      bookId,
      userEmail,
    });

    if (existingBorrow) {
      return res.status(409).json({
        message: "You already have this book borrowed.",
      });
    }

    const updateResult = await booksCollection.updateOne(
      {
        _id: new ObjectId(bookId),
        availableCopies: { $gt: 0 },
      },
      {
        $inc: { availableCopies: -1 },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        message: "This book is currently unavailable.",
      });
    }

    const borrowDate = new Date();
    const returnDate = new Date(borrowDate);
    returnDate.setDate(returnDate.getDate() + 14);

    const newBorrow = {
      bookId,
      bookTitle: book.title,
      bookImage: book.image,
      userEmail,
      borrowDate: borrowDate.toISOString(),
      returnDate: returnDate.toISOString(),
    };

    try {
      const result = await borrowsCollection.insertOne(newBorrow);

      res.status(201).json({
        message: "Book borrowed successfully.",
        borrow: {
          ...newBorrow,
          id: result.insertedId.toString(),
        },
      });
    } catch (error) {
      // Restore the available copy if saving the borrow fails.
      await booksCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $inc: { availableCopies: 1 } }
      );

      throw error;
    }
  } catch (error) {
    console.error("Error borrowing book:", error);

    res.status(500).json({
      message: "Failed to borrow book.",
    });
  }
});



// API 7: Get borrowed books
app.get("/borrows", async (req, res) => {
  
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({
        message: "User email is required.",
      });
    }

    const borrows = await db
      .collection("borrows")
      .find({ userEmail })
      .sort({ borrowDate: -1 })
      .toArray();

    res.send(
      borrows.map((borrow) => ({
        ...borrow,
        id: borrow._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching borrowed books:", error);
    res.status(500).json({
      message: "Failed to fetch borrowed books.",
    });
  }
});

// API 8: Return a borrowed book
app.delete("/borrows/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid borrow ID.",
      });
    }

    const borrowsCollection = db.collection("borrows");
    const booksCollection = db.collection("books");

    const borrow = await borrowsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!borrow) {
      return res.status(404).json({
        message: "Borrowing record not found.",
      });
    }

    const deleteResult = await borrowsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        message: "Borrowing record not found.",
      });
    }

    await booksCollection.updateOne(
      { _id: new ObjectId(borrow.bookId) },
      { $inc: { availableCopies: 1 } }
    );

    res.send({
      message: "Book returned successfully.",
    });
  } catch (error) {
    console.error("Error returning book:", error);
    res.status(500).json({
      message: "Failed to return book.",
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
