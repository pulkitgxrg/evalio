const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const Auth = require('../middleware/Auth');

router.get('/profile',Auth, userController.profileInfo);
router.put('/profile',Auth, userController.updateProfile);
router.patch('/profile/delete',Auth, userController.deleteAccount);

module.exports = router;