const { v4: uuidv4 } = require("uuid");

// This creates a simple digital tourist ID and QR data.
const generateDigitalId = (user) => {
  // Make a unique ID code for each user.
  const rawCode = `WST-${user.fullName.slice(0, 3).toUpperCase()}-${uuidv4().slice(0, 8)}`;

  return {
    idCode: rawCode,
    // Frontend can use this value to show QR data.
    qrValue: JSON.stringify({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      digitalId: rawCode
    })
  };
};

module.exports = generateDigitalId;
