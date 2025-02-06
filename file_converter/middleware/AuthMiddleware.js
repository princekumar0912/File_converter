const jwt = require('jsonwebtoken');
require("dotenv").config();

const authMiddleware = (req, res, next) => {

  // const token = req.header("Authorization");
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "access denied ! no token provided." });

  }
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded user info to the request object
    req.user = decoded;
    // Proceed to the next middleware or route handler
    next();
  }
  catch (error) {
    return res.status(401).json({ message: "invalid token", error });
  }
}
module.exports = authMiddleware;