import Water from "../models/Water.js";

export const waterStatus = (req, res) => {
  const { ph, tds } = req.body;
  
  let score = 100;
  if (ph < 6.5 || ph > 8.5) score -= 30;
  if (tds > 500) score -= 40;

  res.json({
    quality: score,
    status: score > 60 ? "Safe" : "Unsafe",
  });
};

export const addWaterSource = async (req, res) => {
  try {
    const { source, quality, ph, tds, contaminants, location } = req.body;
    const newSource = new Water({
      source,
      quality,
      ph,
      tds,
      contaminants,
      location,
    });
    const savedSource = await newSource.save();
    res.status(201).json(savedSource);
  }
  catch (error) {
    res.status(500).json({ message: "Error saving water sample", error });
  }
};

export const getWaterSources = async (req, res) => {
  try {
    const samples = await Water.find();
    res.status(200).json(samples);
  }
  catch (error) {
    res.status(500).json({ message: "Error retrieving water samples", error });
  }
};  

