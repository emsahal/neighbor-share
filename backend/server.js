const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const app = express();
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/items', require('./routes/item.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/requests', require('./routes/request.routes'));


app.get('/', (req, res) => {
  res.send('NeighbourShare API is RUNNING!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });