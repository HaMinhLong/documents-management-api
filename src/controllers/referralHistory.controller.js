import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  const { referred_id, order_id, commission_amount, status } = req.body;

  try {
    const referralHistory = await prisma.referralHistory.create({
      data: {
        referred_id,
        order_id,
        commission_amount,
        status,
      },
    });

    responseUtil.success(res, "Tạo giao dịch thành công", referralHistory, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo giao dịch", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const referralHistories = await prisma.referralHistory.findMany({
      where: { user_id: user_id },
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.referralHistory.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: referralHistories,
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
  const referralHistory = await prisma.referralHistory.findUnique({
    where: { id: parseInt(id) },
  });
  return referralHistory;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const referralHistory = await checkRecordExists(id);
    if (!referralHistory) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      referralHistory,
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
  const { referred_id, order_id, commission_amount, status } = req.body;

  try {
    const referralHistory = await checkRecordExists(id);
    if (!referralHistory) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.referralHistory.create({
      data: {
        referred_id,
        order_id,
        commission_amount,
        status,
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
    const referralHistory = await checkRecordExists(id);
    if (!referralHistory) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.referralHistory.delete({
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
