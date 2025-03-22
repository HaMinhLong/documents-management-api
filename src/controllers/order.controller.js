import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createOrder = async (req, res) => {
  const { user_id, total_amount, status } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        user_id,
        total_amount,
        status,
      },
    });
    responseUtil.success(res, "Tạo mới thành công", order, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo mới", error.message, 500);
  }
};

const getOrders = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const orders = await prisma.order.findMany({
      where: { user_id: user_id },
      skip: offset,
      take: parseInt(limit),
    });

    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalOrders,
          totalPages,
        },
      },
      200
    );
  } catch (error) {
    responseUtil.error(res, "Lấy danh sách thất bại", error.message, 500);
  }
};

const checkOrderExists = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
  });
  return order;
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await checkOrderExists(id);
    if (!order) {
      responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(res, "Lấy thông tin bản ghi thành công", order, 200);
  } catch (error) {
    responseUtil.error(
      res,
      "Lấy thông tin bản ghi thất bại",
      error.message,
      500
    );
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { user_id, total_amount, status } = req.body;

  try {
    const order = await checkOrderExists(id);
    if (!order) {
      responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { user_id, total_amount, status },
    });

    responseUtil.success(res, "Cập nhật thành công", updatedOrder, 200);
  } catch (error) {
    responseUtil.error(res, "Cập nhật thất bại", error.message, 500);
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await checkOrderExists(id);
    if (!order) {
      responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    responseUtil.success(res, "Xoá bản ghi thành công", 204);
  } catch (error) {
    responseUtil.error(res, "Xoá bản ghi thất bại", error.message, 500);
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
