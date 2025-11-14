export const getEvents = (req, res) => {
  res.json([
    { id: 1, name: "Beach Cleanup", carbonOffset: 15 },
    { id: 2, name: "Tree Planting Drive", carbonOffset: 25 }
  ]);
};
