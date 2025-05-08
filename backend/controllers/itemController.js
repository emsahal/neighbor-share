const Item = require('../models/Item');
const fs = require('fs').promises;
// Add item
exports.addItem = async (req, res) => {
  const { name, category, availability, location, prices } = req.body;
  const owner = req.user.id;

  try {
    if (!['Hour', 'Day', 'Week'].includes(availability)) {
      return res.status(400).json({ message: 'Invalid availability' });
    }

    if (!prices || typeof prices !== 'object') {
      return res.status(400).json({ message: 'Prices object is required' });
    }

    const { hourly, daily, weekly } = prices;
    const priceFields = {
      hourly: Number.isInteger(parseInt(hourly)) ? parseInt(hourly) : 0,
      daily: Number.isInteger(parseInt(daily)) ? parseInt(daily) : 0,
      weekly: Number.isInteger(parseInt(weekly)) ? parseInt(weekly) : 0,
    };

    if (
      (availability === 'Hour' && priceFields.hourly === 0) ||
      (availability === 'Day' && priceFields.daily === 0) ||
      (availability === 'Week' && priceFields.weekly === 0)
    ) {
      return res.status(400).json({
        message: `Price for ${availability} must be greater than 0 PKR`,
      });
    }

    if (priceFields.hourly < 0 || priceFields.daily < 0 || priceFields.weekly < 0) {
      return res.status(400).json({ message: 'Prices must be non-negative' });
    }

    // Handle image if uploaded
    let img = {};
    if (req.file) {
      img = {
        data: await fs.readFile(req.file.path),
        contentType: req.file.mimetype,
      };
      // Clean up the uploaded file
      await fs.unlink(req.file.path);
    }

    const item = new Item({
      name,
      category,
      availability,
      location,
      owner,
      prices: priceFields,
      img,
    });

    await item.save();

    res.status(201).json({
      ...item._doc,
      prices: {
        hourly: item.prices.hourly,
        daily: item.prices.daily,
        weekly: item.prices.weekly,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Search items
exports.searchItems = async (req, res) => {
  const { location, category, availability, maxPrice } = req.query;

  try {
    const query = {};
    if (location) query.location = location;
    if (category) query.category = category;
    if (availability) query.availability = availability;

  
    if (maxPrice && availability) {
      const priceInPKR = parseInt(maxPrice);
      if (isNaN(priceInPKR) || priceInPKR < 0) {
        return res.status(400).json({ message: 'Invalid maxPrice' });
      }
      if (availability === 'Hour') query['prices.hourly'] = { $lte: priceInPKR };
      if (availability === 'Day') query['prices.daily'] = { $lte: priceInPKR };
      if (availability === 'Week') query['prices.weekly'] = { $lte: priceInPKR };
    }

    const items = await Item.find(query).populate('owner', 'name rating');


    const formattedItems = items.map(item => ({
      ...item._doc,
      prices: {
        hourly: item.prices.hourly,
        daily: item.prices.daily,
        weekly: item.prices.weekly,
      },
    }));

    res.json(formattedItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getItemImage = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || !item.img.data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', item.img.contentType);
    res.send(item.img.data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requestItem = async (req, res) => {
  const { itemId, availability } = req.body;

  try {
    if (!['Hour', 'Day', 'Week'].includes(availability)) {
      return res.status(400).json({ message: 'Invalid availability' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status === 'Borrowed') {
      return res.status(400).json({ message: 'Item is already borrowed' });
    }

    if (item.availability !== availability) {
      return res.status(400).json({
        message: `Item is only available for ${item.availability}`,
      });
    }

    item.status = 'Borrowed';
    await item.save();

    const priceField = availability === 'Hour' ? 'hourly' : availability === 'Day' ? 'daily' : 'weekly';
    const price = item.prices[priceField];

    res.json({
      message: 'Item requested successfully',
      item: {
        ...item._doc,
        prices: {
          hourly: item.prices.hourly,
          daily: item.prices.daily,
          weekly: item.prices.weekly,
        },
        requestedPrice: price,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};