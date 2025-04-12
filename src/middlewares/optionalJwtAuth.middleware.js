import jwt from "jsonwebtoken";

const optionalJwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

export default optionalJwtAuth;
