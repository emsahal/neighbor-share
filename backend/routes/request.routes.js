const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Item = require('../models/Item');
const authenticate = require('../middlewares/auth.middleware');

// Create a new request
router.post('/', authenticate, async (req, res) => {
  const { itemId, availability } = req.body;
  try {
    const item = await Item.findById(itemId).populate('owner');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'Available') {
      return res.status(400).json({ message: 'Item is not available' });
    }
    if (item.owner._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot request your own item' });
    }

    const request = new Request({
      item: itemId,
      requester: req.user.id,
      owner: item.owner._id,
      availability,
    });

    await request.save();
    item.requests.push(request._id);
    await item.save();

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests for the logged-in user (as owner or requester)
router.get('/', authenticate, async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ owner: req.user.id }, { requester: req.user.id }],
    })
      .populate('item')
      .populate('requester', 'name')
      .populate('owner', 'name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id/return', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('item');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'Accepted') {
      return res.status(400).json({ message: 'Item is not currently borrowed' });
    }

    request.status = 'Completed';
    request.item.status = 'Available';
    await request.save();
    await request.item.save();

    res.json({
      message: 'Item returned',
      request,
      item: { _id: request.item._id, status: 'Available' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// accept
router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('item');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'Accepted';
    request.rentalStartTime = new Date(); // Set rental start time
    request.item.status = 'Borrowed';
    await request.save();
    await request.item.save();

    res.json({
      message: 'Request accepted',
      request,
      item: { _id: request.item._id, status: 'Borrowed' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Decline a request
router.put('/:id/decline', authenticate, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'Declined';
    await request.save();

    res.json({ message: 'Request declined', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;