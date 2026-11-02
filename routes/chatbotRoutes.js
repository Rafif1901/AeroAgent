const express = require('express');
const router = express.Router();
const { handleChatQuery, submitChatFeedback } = require('../controllers/chatbotController');

router.post('/query', handleChatQuery);
router.post('/feedback', submitChatFeedback);

module.exports = router;