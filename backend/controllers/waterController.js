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
    const { name, source, quality, ph, tds, contaminants, location, tests } = req.body;
    
    // Validate required fields
    if (!name || !location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ 
        message: "Name and valid location coordinates are required" 
      });
    }

    const newSource = new Water({
      name,
      source: source || "User Submitted",
      quality: quality || "Unknown",
      ph,
      tds,
      contaminants: contaminants || [],
      tests: tests || {},
      location: {
        type: "Point",
        coordinates: location.coordinates, // [longitude, latitude]
      },
      addedBy: req.user?.id, // Optional: track who added it
    });

    const savedSource = await newSource.save();
    res.status(201).json(savedSource);
  }
  catch (error) {
    console.error("Error saving water source:", error);
    res.status(500).json({ message: "Error saving water sample", error: error.message });
  }
};

export const getWaterSources = async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;

    let query = {};

    // If coordinates provided, find sources within radius (default 50km)
    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const radiusInKm = parseFloat(radius) || 50;
      const radiusInMeters = radiusInKm * 1000;

      query = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        }
      };
    }

    const samples = await Water.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // Limit results to prevent overload

    res.status(200).json(samples);
  }
  catch (error) {
    console.error("Error retrieving water samples:", error);
    res.status(500).json({ message: "Error retrieving water samples", error: error.message });
  }
};

export const deleteWaterSource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedSource = await Water.findByIdAndDelete(id);
    
    if (!deletedSource) {
      return res.status(404).json({ message: "Water source not found" });
    }

    res.status(200).json({ 
      message: "Water source deleted successfully",
      deletedSource 
    });
  }
  catch (error) {
    console.error("Error deleting water source:", error);
    res.status(500).json({ message: "Error deleting water source", error: error.message });
  }
};

export const updateWaterSource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSource = await Water.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedSource) {
      return res.status(404).json({ message: "Water source not found" });
    }

    res.status(200).json(updatedSource);
  }
  catch (error) {
    console.error("Error updating water source:", error);
    res.status(500).json({ message: "Error updating water source", error: error.message });
  }
};