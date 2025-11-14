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
