const pool = require('../db');

const getAllTrains = async () => {
  const result = await pool.query('SELECT * FROM train');
  return result.rows;
};

module.exports = {
  getAllTrains,
};
