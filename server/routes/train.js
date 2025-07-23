const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train');

const trainLocationController = require('../controllers/trainLocation');

router.get('/', trainController.getAllTrains);

// Train location endpoints
router.post('/location', trainLocationController.updateLocation); // POST /api/train/location
router.get('/location/:train_id', trainLocationController.getLocation); // GET /api/train/location/:train_id

module.exports = router;


