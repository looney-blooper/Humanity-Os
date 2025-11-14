import Pin from "../models/Pin.js";

export const getPins = async (req, res) => {
  const pins = await Pin.find();
  res.json(pins);
};

export const addPin = async (req, res) => {
  const pin = await Pin.create(req.body);
  res.json(pin);
};
