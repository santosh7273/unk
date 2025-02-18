import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sampleDB";
mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Mongoose Schema
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.get("/fetch", async (req, res) => {
  try {
    const data = await Form.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.post("/contact", async (req, res) => {
  try {
    const newForm = new Form(req.body);
    await newForm.save();
    res.status(201).json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving data" });
  }
});
app.put("/update", async (req, res) => {
  try {
    const { email, newName } = req.body;

    if (!email || !newName) {
      return res.status(400).json({ message: "Email and new name are required" });
    }

    // Find and update the user by email
    const updatedUser = await Form.findOneAndUpdate(
      { email: email },
      { name: newName },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    res.json({ message: `User's name updated to '${newName}' successfully`, updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating entry", error });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const deletedEntry = await Form.findOneAndDelete({ name, email });

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: `User '${name}' deleted successfully` });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ message: "Error deleting entry" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
