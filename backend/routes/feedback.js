const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.submitFeedback);
router.get('/', feedbackController.getFeedback);
router.get('/summary', feedbackController.getFeedbackSummary);

module.exports = router;

