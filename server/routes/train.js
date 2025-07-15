const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train');

router.get('/', trainController.getAllTrains);

module.exports = router;


