import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  const { order_id, document_id, price } = req.body;

  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        order_id,
        document_id,
        price,
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", orderItem, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const orderItems = await prisma.orderItem.findMany({
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.orderItem.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: orderItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalRecords,
          totalPages,
        },
      },
      200
    );
  } catch (error) {
    responseUtil.error(res, "Lấy danh sách thất bại", error.message, 500);
  }
};

const checkRecordExists = async (id) => {
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: parseInt(id) },
  });
  return orderItem;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderItem = await checkRecordExists(id);
    if (!orderItem) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      orderItem,
      200
    );
  } catch (error) {
    responseUtil.error(
      res,
      "Lấy thông tin bản ghi thất bại",
      error.message,
      500
    );
  }
};

const updateRecord = async (req, res) => {
  const { id } = req.params;
  const { order_id, document_id, price } = req.body;

  try {
    const orderItem = await checkRecordExists(id);
    if (!orderItem) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.orderItem.update({
      where: { id: parseInt(id) },
      data: {
        order_id,
        document_id,
        price,
      },
    });

    responseUtil.success(res, "Cập nhật thành công", updatedRecord, 200);
  } catch (error) {
    responseUtil.error(res, "Cập nhật thất bại", error.message, 500);
  }
};

const deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const orderItem = await checkRecordExists(id);
    if (!orderItem) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.orderItem.delete({
      where: { id: parseInt(id) },
    });

    responseUtil.success(res, "Xoá bản ghi thành công", 204);
  } catch (error) {
    responseUtil.error(res, "Xoá bản ghi thất bại", error.message, 500);
  }
};

export default {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
