import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  try {
    const { title, description, price, subject_id, university_id } = req.body;
    const file_path = req.files?.file?.[0]?.path || null;
    const instruct_path = req.files?.instruct?.[0]?.path || null;

    const user_id = req.user?.id;

    if (!user_id) {
      return responseUtil.error(
        res,
        "Không xác định được người dùng",
        null,
        401
      );
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        file_path,
        instruct_path,
        user_id: parseInt(user_id),
        subject_id: parseInt(subject_id),
        university_id: parseInt(university_id),
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", document, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const documents = await prisma.document.findMany({
      where: { user_id: user_id },
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.document.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: documents,
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
  return await prisma.document.findUnique({
    where: { id: parseInt(id) },
    include: {
      subject: true,
      university: true,
      user: true,
    },
  });
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await checkRecordExists(id);
    if (!document) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      document,
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
  try {
    const { id } = req.params;
    const { title, description, price, subject_id, university_id } = req.body;

    const user_id = req.user?.id;

    if (!user_id) {
      return responseUtil.error(
        res,
        "Không xác định được người dùng",
        null,
        401
      );
    }

    const file_path = req.files?.file?.[0]?.path || null;
    const instruct_path = req.files?.instruct?.[0]?.path || null;

    const updateData = {
      title,
      description,
      price: parseFloat(price),
      user_id: parseInt(user_id),
      subject_id: parseInt(subject_id),
      university_id: parseInt(university_id),
    };

    if (file_path) {
      updateData.file_path = file_path;
    }
    if (instruct_path) {
      updateData.instruct_path = instruct_path;
    }

    const updatedDocument = await prisma.document.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    responseUtil.success(
      res,
      "Cập nhật bản ghi thành công",
      updatedDocument,
      200
    );
  } catch (error) {
    responseUtil.error(
      res,
      "Xảy ra lỗi khi cập nhật bản ghi",
      error.message,
      500
    );
  }
};

const deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await checkRecordExists(id);
    if (!document) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.document.delete({
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
