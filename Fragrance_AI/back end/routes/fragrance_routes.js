const express = require("express");
const router = express.Router();
const Perfume = require("../models/perfumeModel");
const { spawn } = require("child_process");

// Get all perfumes
router.get("/", async (req, res) => {
  const perfumes = await Perfume.find();
  res.json(perfumes);
});

// Add a new perfume
router.post("/add", async (req, res) => {
  const newPerfume = new Perfume(req.body);
  await newPerfume.save();
  res.json({ message: "Perfume added successfully!" });
});

// Call AI model
router.post("/analyze", (req, res) => {
  const { notes } = req.body;
  const python = spawn("python", ["./backend/ai/fragrance_model.py", JSON.stringify(notes)]);

  python.stdout.on("data", (data) => {
    const output = data.toString();
    res.json({ prediction: output });
  });

  python.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
    res.status(500).json({ error: "AI model failed." });
  });
});

module.exports = router;
