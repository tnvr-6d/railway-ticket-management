// In-memory storage for demo
const trainLocations = {};

// POST /api/train/location
exports.updateLocation = (req, res) => {
  const { train_id, latitude, longitude, timestamp } = req.body;
  if (!train_id || !latitude || !longitude) {
    return res.status(400).json({ error: 'train_id, latitude, and longitude are required' });
  }
  trainLocations[train_id] = {
    latitude,
    longitude,
    timestamp: timestamp || Date.now(),
  };
  console.log('Current trainLocations:', trainLocations);
  res.json({ success: true });
};

// GET /api/train/location/:train_id
exports.getLocation = (req, res) => {
  const { train_id } = req.params;
  const location = trainLocations[train_id];
  if (!location) {
    return res.status(404).json({ error: 'No location found for this train' });
  }
  res.json(location);
}; 