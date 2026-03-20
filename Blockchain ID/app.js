const express = require('express');
const path = require('path');
const touristIdRoutes = require('./routes/touristIdRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/tourists', touristIdRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((error, req, res, next) => {
  res.status(400).json({
    success: false,
    message: error.message || 'Unexpected error',
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`TourBuddy backend listening on port ${port}`);
  });
}

module.exports = app;
