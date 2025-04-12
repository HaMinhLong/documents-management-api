import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import nodemailer from "nodemailer";

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

    const { ...userData } = user;
    responseUtil.success(res, "Đăng nhập thành công", {
      token,
      user: userData,
    });
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi đăng nhập", error.message, 500);
  }
};

const googleLogin = async (req, res) => {
  const { access_token } = req.body;

  try {
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name, id: googleId } = userInfoResponse.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          full_name: name,
          username: googleId,
          password_hash: `google_${googleId}`,
          status: "active",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    responseUtil.success(res, "Đăng nhập thành công", { token }, 200);
  } catch (error) {
    responseUtil.error(res, "Đăng nhập thất bại", error.message, 500);
  }
};

const facebookLogin = async (req, res) => {
  const { access_token } = req.body;

  try {
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
    );
    const { email, name, id: facebookId } = fbResponse.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          full_name: name,
          username: facebookId,
          password_hash: `facebook_${facebookId}`,
          status: "active",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    responseUtil.success(res, "Đăng nhập thành công", { token, user }, 200);
  } catch (error) {
    responseUtil.error(res, "Đăng nhập thất bại", error.message, 500);
  }
};

const register = async (req, res) => {
  const { email, username, full_name, password, phone } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      return responseUtil.error(
        res,
        "Email hoặc username đã tồn tại",
        null,
        400
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        phone,
        full_name,
        password_hash: passwordHash,
        status: "active",
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    responseUtil.success(res, "Đăng kí thành công", { token }, 201);
  } catch (error) {
    responseUtil.error(res, "Đăng kí thất bại", error.message, 500);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return responseUtil.error(res, "Email không tồn tại", null, 404);
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    await prisma.resetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <p>Chào ${user.full_name || user.username},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để đặt lại:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    responseUtil.success(
      res,
      "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn",
      null,
      200
    );
  } catch (error) {
    responseUtil.error(res, "Gửi yêu cầu thất bại", error.message, 500);
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    const { userId } = decoded;

    const resetToken = await prisma.resetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return responseUtil.error(
        res,
        "Liên kết không hợp lệ hoặc đã hết hạn",
        null,
        400
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });

    await prisma.resetToken.delete({ where: { token } });

    responseUtil.success(res, "Đặt lại mật khẩu thành công", null, 200);
  } catch (error) {
    responseUtil.error(res, "Đặt lại mật khẩu thất bại", error.message, 500);
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

export default {
  loginUser,
  getMe,
  facebookLogin,
  googleLogin,
  register,
  forgotPassword,
  resetPassword,
};
