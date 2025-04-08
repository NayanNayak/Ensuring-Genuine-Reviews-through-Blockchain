import jwt from "jsonwebtoken";
import User from "../models/user";
import Boom from "boom";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(Boom.unauthorized("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(Boom.unauthorized("User not found"));
    }

    req.user = user; // Store user details in req object
    next();
  } catch (error) {
    return next(Boom.unauthorized("Invalid token"));
  }
};

export default authMiddleware;
