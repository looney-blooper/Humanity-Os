import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ------------------------------
// REGISTER
// ------------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({
        error: { email: "User with this email already exists" },
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed" });
  }
};

// ------------------------------
// LOGIN
// ------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: { email: "Email not found" } });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: { password: "Incorrect password" } });

    return res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};

// ------------------------------
// PROFILE (GET)
// ------------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user); // ✔ IMPORTANT
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch profile" });
  }
};


// ------------------------------
// PROFILE UPDATE (PUT)
// ------------------------------
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      name,
      phone,
      age,
      bio,
      preferences,
      metrics,
      location
    } = req.body;

    if (name) user.name = name;

    if (phone) user.phone = phone;

    if (age !== undefined) user.age = age;

    if (bio) user.bio = bio;

    if (preferences && typeof preferences === "object") {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (metrics && typeof metrics === "object") {
      user.metrics = {
        ...user.metrics,
        ...metrics
      };
    }

    if (location && Array.isArray(location.coordinates)) {
      user.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }

    user.lastActive = Date.now();

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      age: updatedUser.age,
      bio: updatedUser.bio,
      role: updatedUser.role,
      preferences: updatedUser.preferences,
      metrics: updatedUser.metrics,
      location: updatedUser.location,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Profile update failed" });
  }
};


