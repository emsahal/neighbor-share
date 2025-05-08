const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/auth.middleware');

router.get('/profile', authenticate, userController.getProfile);
router.put('/rate', authenticate, userController.rateUser);

module.exports = router;