import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect MongoDB (optional)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ DB connection error:", err));

// Email Schema (if using Mongo)
const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});
const Email = mongoose.model("Email", EmailSchema);

// POST route for emails
app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "Email is required" });

  try {
    // Optional: Save to MongoDB
    const newEmail = new Email({ email });
    await newEmail.save();

    console.log("📩 New email received:", email);
    res.status(200).json({ message: "Subscription successful!" });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
