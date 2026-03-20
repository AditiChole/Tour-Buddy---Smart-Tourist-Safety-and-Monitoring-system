// Allow only selected roles to use this route.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to access this resource"
    });
  }

  next();
};

module.exports = { authorize };
