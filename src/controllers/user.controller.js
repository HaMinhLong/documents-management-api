import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createUser = async (req, res) => {
  const { username, email, password, full_name, phone, referral_code } =
    req.body;

  try {
    const saltRounds = 10;
    const passwordHashed = await bcrypt.hash(password, saltRounds);

    const existingDeletedUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email, is_deleted: true },
          { username, is_deleted: true },
          { referral_code, is_deleted: true },
        ],
      },
    });

    let user;

    if (existingDeletedUser) {
      user = await prisma.user.update({
        where: { id: existingDeletedUser.id },
        data: {
          username,
          email,
          password_hash: passwordHashed,
          full_name,
          phone,
          referral_code,
          is_deleted: false,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password_hash: passwordHashed,
          full_name,
          phone,
          referral_code,
        },
      });
    }

    responseUtil.success(res, "Tạo mới thành công", user, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo mới", error.message, 500);
  }
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      where: { is_deleted: false },
      skip: offset,
      take: parseInt(limit),
    });

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalUsers,
          totalPages,
        },
      },
      200
    );
  } catch (error) {
    responseUtil.error(res, "Lấy danh sách thất bại", error.message, 500);
  }
};

const checkUserExists = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  return user;
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await checkUserExists(id);
    if (!user) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(res, "Lấy thông tin bản ghi thành công", user, 200);
  } catch (error) {
    responseUtil.error(
      res,
      "Lấy thông tin bản ghi thất bại",
      error.message,
      500
    );
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    password_hash,
    full_name,
    phone,
    balance,
    referral_code,
    status,
    level,
  } = req.body;
  try {
    const user = await checkUserExists(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username,
        email,
        password_hash,
        full_name,
        phone,
        balance,
        referral_code,
        status,
        level,
      },
    });

    responseUtil.success(res, "Cập nhật thành công", updatedUser, 200);
  } catch (error) {
    responseUtil.error(res, "Cập nhật thất bại", error.message, 500);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await checkUserExists(id);
    if (!user) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true },
    });

    responseUtil.success(res, "Xoá bản ghi thành công", 204);
  } catch (error) {
    responseUtil.error(res, "Xoá bản ghi thất bại", error.message, 500);
  }
};

export default { createUser, getUsers, getUserById, updateUser, deleteUser };
