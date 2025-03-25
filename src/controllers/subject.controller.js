import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  const { name, description, status } = req.body;

  try {
    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        status,
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", subject, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, name, status } = req.query;
  const offset = (page - 1) * limit;

  try {
    const subjects = await prisma.subject.findMany({
      where: {
        status,
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.subject.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: subjects,
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
  const subject = await prisma.subject.findUnique({
    where: { id: parseInt(id) },
  });
  return subject;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await checkRecordExists(id);
    if (!subject) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(res, "Lấy thông tin bản ghi thành công", subject, 200);
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
  const { name, status, description } = req.body;

  try {
    const subject = await checkRecordExists(id);
    if (!subject) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    const updatedRecord = await prisma.subject.update({
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
    const subject = await checkRecordExists(id);
    if (!subject) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.subject.delete({
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
