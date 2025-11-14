export const fireRisk = (req, res) => {
  const { temp, humidity, wind } = req.body;

  const score = temp * 0.4 + wind * 0.3 - humidity * 0.3;

  res.json({
    risk: Math.min(100, Math.max(0, Math.round(score))),
    status: score > 60 ? "High" : "Low"
  });
};
