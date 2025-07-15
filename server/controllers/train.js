const trainModel = require('../models/train');

const getAllTrains = async (req, res) => {
  try {
    const trains = await trainModel.getAllTrains();
    res.json(trains);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  getAllTrains,
};
