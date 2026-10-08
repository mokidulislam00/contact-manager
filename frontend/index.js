const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Contact = require("./models/Contact");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });

// Home route

app.get("/", (req, res) => {
  res.json({
    message: "Contact Manager API is running!",
  });
});

// Get all contacts
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find();

    res.json(contacts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get contacts",
      error: error.message,
    });
  }
});
// Get a single contact
app.get("/api/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get contact",
      error: error.message,
    });
  }
});
// Create a new contact
app.post("/api/contacts", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      address,
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create contact",
      error: error.message,
    });
  }
});
// Update a contact
app.put("/api/contacts/:id", async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        address,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update contact",
      error: error.message,
    });
  }
});
// Delete a contact
app.delete("/api/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.json({
      message: "Contact deleted successfully",
      contact,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete contact",
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});