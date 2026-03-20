const { BlockchainService } = require('../services/blockchainService');

const blockchainService = new BlockchainService();

async function createTouristDigitalId(req, res, next) {
  try {
    const record = await blockchainService.registerDigitalTouristId({
      touristId: req.body.touristId,
      tripId: req.body.tripId,
      tripStart: req.body.tripStart,
      tripEnd: req.body.tripEnd,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTouristDigitalId,
};
