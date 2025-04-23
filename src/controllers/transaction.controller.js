import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  let { user_id, amount, type, status, reference_id, description } = req.body;

  if (!user_id) {
    user_id = req.user?.id;
  }

  if (!user_id) {
    return responseUtil.error(res, "Không xác định được người dùng", null, 401);
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        user_id,
        amount,
        type,
        status,
        reference_id,
        description,
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", transaction, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: user_id },
      orderBy: { created_at: "desc" },
      include: {
        user: true,
      },
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.transaction.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: transactions,
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
  const transaction = await prisma.transaction.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
  });
  return transaction;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await checkRecordExists(id);
    if (!transaction) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      transaction,
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

const updateRecordStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedTransaction = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    responseUtil.success(
      res,
      "Cập nhật trạng thái thành công",
      updatedTransaction
    );
  } catch (error) {
    responseUtil.error(
      res,
      "Xảy ra lỗi khi cập nhật trạng thái",
      error.message,
      500
    );
  }
};

const updateRecord = async (req, res) => {
  const { id } = req.params;
  const { amount, type, status, reference_id, description } = req.body;

  try {
    const transaction = await checkRecordExists(id);
    if (!transaction) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        amount,
        type,
        status,
        reference_id,
        description,
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
    const transaction = await checkRecordExists(id);
    if (!transaction) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.transaction.delete({
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
  updateRecordStatus,
  updateRecord,
  deleteRecord,
};
