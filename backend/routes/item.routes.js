const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

router.post('/', authenticate, upload.single('image'), itemController.addItem);

router.get('/', itemController.searchItems);

router.post('/request', authenticate, itemController.requestItem);

router.get('/:id/image', itemController.getItemImage);

module.exports = router;