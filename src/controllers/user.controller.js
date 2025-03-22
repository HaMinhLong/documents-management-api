import prisma from "../prisma.js";

const createUser = async (req, res) => {
  const { username, email, password_hash, full_name, phone, referral_code } =
    req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        full_name,
        phone,
        referral_code,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to create user", details: error.message });
  }
};

const getUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({
      skip: offset,
      take: parseInt(limit),
    });

    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: error.message });
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
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
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
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to update user", details: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await checkUserExists(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res
      .status(400)
      .json({ error: "Failed to delete user", details: error.message });
  }
};

export default { createUser, getUsers, getUserById, updateUser, deleteUser };
