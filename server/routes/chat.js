const express = require('express');
const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;
  // Simple mock logic for demo
  let reply = "Sorry, I didn't understand that.";
  if (message) {
    if (/schedule|time|train/i.test(message)) {
      reply = 'You can view train schedules by specifying your source and destination.';
    } else if (/route|station/i.test(message)) {
      reply = 'Please tell me your starting and ending stations to get route info.';
    } else if (/hello|hi|hey/i.test(message)) {
      reply = 'Hello! How can I assist you with your train journey?';
    }
  }
  res.json({ reply });
});

module.exports = router; 