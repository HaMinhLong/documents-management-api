import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return responseUtil.error(
      res,
      "Vui lòng cung cấp email và mật khẩu",
      null,
      400
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return responseUtil.error(res, "Tài khoản không tồn tại", null, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return responseUtil.error(
        res,
        "Email hoặc mật khẩu không chính xác",
        null,
        401
      );
    }

    if (user.status === "blocked") {
      return responseUtil.error(res, "Tài khoản của bạn đã bị khóa", null, 403);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    const { password_hash, ...userData } = user;
    responseUtil.success(res, "Đăng nhập thành công", {
      token,
      user: userData,
    });
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi đăng nhập", error.message, 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        avatar: true,
        email: true,
        full_name: true,
        phone: true,
        balance: true,
        referral_code: true,
        is_deleted: true,
      },
    });

    if (!user) {
      return responseUtil.error(res, "Người dùng không tồn tại", null, 404);
    }

    responseUtil.success(res, "Lấy thông tin thành công", user);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi lấy thông tin", error.message, 500);
  }
};

export default { loginUser, getMe };
