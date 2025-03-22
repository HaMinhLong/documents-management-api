import jwt from "jsonwebtoken";
import responseUtil from "../utils/response.util.js";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return responseUtil.error(res, "Không có token xác thực", null, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    responseUtil.error(res, "Token không hợp lệ", null, 401);
  }
};

export default authMiddleware;
