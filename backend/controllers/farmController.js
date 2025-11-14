import Farm from "../models/Farm.js";

// Create a new farm field
export const createFarm = async (req, res) => {
  try {
    const { fieldName, plantType, coordinates } = req.body;

    const farm = await Farm.create({
      user: req.user._id,
      fieldName,
      plantType,
      location: {
        type: "Point",
        coordinates
      }
    });

    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add watering log
export const addWaterLog = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { amount } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    farm.wateringLogs.push({ amount });
    await farm.save();

    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add generic activity log
export const addActivityLog = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { action, notes } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    farm.activityLogs.push({ action, notes });
    await farm.save();

    res.json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all farms for the user
export const getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user._id });
    res.json(farms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Basic non-AI maintenance suggestion system
export const getFarmSuggestions = async (req, res) => {
  try {
    const { farmId } = req.params;
    const farm = await Farm.findById(farmId);

    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const lastWater = farm.wateringLogs[farm.wateringLogs.length - 1];

    let suggestions = [];

    // Simple rule-based suggestions (AI team will replace)
    suggestions.push(`Plant type: ${farm.plantType}`);

    if (!lastWater || (Date.now() - new Date(lastWater.date)) / (1000 * 3600 * 24) > 2) {
      suggestions.push("⚠️ It has been more than 2 days since last watering.");
    } else {
      suggestions.push("💧 Watering frequency looks good.");
    }

    if (farm.activityLogs.length === 0) {
      suggestions.push("ℹ️ No activity logs yet. Start logging fertilizer/weed removal.");
    }

    res.json({ farm, suggestions });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
