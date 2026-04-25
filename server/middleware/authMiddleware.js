import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "No token" });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload expected to contain { id, role }
    console.log("Auth Middleware - Payload:", payload);
    req.user = payload;
    next();
  } catch (err) {
    console.error("Auth Middleware - Token Error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token. Please login again." });
  }
};

export const isProvider = (req, res, next) => {
  const role = req.user?.role;
  console.log("Role Check - User Role:", role);
  if (role === 'provider' || role === 'admin') {
    return next();
  }
  return res.status(403).json({ msg: `Access denied. Role is currently '${role || 'none'}', but Provider is required.` });
};
