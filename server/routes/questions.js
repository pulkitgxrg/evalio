const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/Auth');

router.post('/', isAdmin, questionController.createQuestion);
router.post('/bulk', isAdmin, questionController.bulkCreateQuestions);
router.post('/generate', isAdmin, questionController.generateQuestions);
router.post('/available-counts', isAdmin, questionController.getAvailableCounts);
router.get('/bank', isAuth, questionController.getQuestionBank);
router.get('/', isAdmin, questionController.getQuestions);

module.exports = router;