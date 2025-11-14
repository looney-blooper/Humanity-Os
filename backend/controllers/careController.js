export const carePlaceholder = (req, res) => {
  const { text } = req.body;

  // Placeholder so frontend can render UI
  res.json({
    sentiment: "neutral",
    stress_level: 45,
    primary_emotion: "calm",
    summary: "AI module will analyze text once integrated.",
  });
};
