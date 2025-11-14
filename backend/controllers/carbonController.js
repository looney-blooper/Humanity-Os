export const calculateCarbon = (req, res) => {
  const { travel, energy, diet } = req.body;

  const carbon =
    (travel || 0) * 0.12 +
    (energy || 0) * 0.9 +
    (diet === "veg" ? 1 : 3);

  res.json({
    carbon,
    suggestion: "Reduce travel or energy consumption for lower emissions."
  });
};
