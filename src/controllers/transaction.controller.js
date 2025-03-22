import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  const { user_id, amount, type, status, reference_id, description } = req.body;

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

    responseUtil.success(res, "Tạo giao dịch thành công", transaction, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo giao dịch", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { user_id: user_id },
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
  const { user_id, amount, type, status, reference_id, description } = req.body;

  try {
    const transaction = await checkRecordExists(id);
    if (!transaction) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        user_id,
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
