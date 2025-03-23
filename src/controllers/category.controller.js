import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        description,
        status,
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", category, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const categories = await prisma.category.findMany({
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.category.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: categories,
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
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });
  return category;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await checkRecordExists(id);
    if (!category) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      category,
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
    const updatedRecord = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    responseUtil.success(res, "Cập nhật trạng thái thành công", updatedRecord);
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
  const { name, status, description } = req.body;

  try {
    const category = await checkRecordExists(id);
    if (!category) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
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
    const category = await checkRecordExists(id);
    if (!category) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.category.delete({
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
