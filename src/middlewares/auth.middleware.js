import jwt from "jsonwebtoken";
import responseUtil from "../utils/response.util.js";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    req.user = null; // Không có token, gán user là null
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Token hợp lệ, gán user
    next();
  } catch (error) {
    req.user = null; // Token không hợp lệ, coi như không có user
    next();
    // Lưu ý: Không trả lỗi 401 để cho phép truy cập công khai
  }
};

export default authMiddleware;
