const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  try {
    req.user = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
