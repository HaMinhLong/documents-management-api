import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  try {
    const { document_id, name, status } = req.body;
    const image_path = req.files?.file?.[0]?.path || null;

    const fileImage = await prisma.fileImage.create({
      data: {
        name,
        status,
        image_path,
        document_id: parseInt(document_id),
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", fileImage, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRecords = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const fileImages = await prisma.fileImage.findMany({
      where: { user_id: user_id },
      skip: offset,
      take: parseInt(limit),
    });

    const totalRecords = await prisma.fileImage.count();
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách thành công",
      {
        data: fileImages,
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
  const fileImage = await prisma.fileImage.findUnique({
    where: { id: parseInt(id) },
  });
  return fileImage;
};

const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const fileImage = await checkRecordExists(id);
    if (!fileImage) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      fileImage,
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
    const { document_id, name, status } = req.body;
    const image_path = req.files?.file?.[0]?.path || null;

    const updateData = {
      name,
      status,
      image_path,
      document_id: parseInt(document_id),
    };

    if (file_path) {
      updateData.file_path = file_path;
    }
    if (instruct_path) {
      updateData.instruct_path = instruct_path;
    }

    const updatedRecord = await prisma.fileImage.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    responseUtil.success(
      res,
      "Cập nhật bản ghi thành công",
      updatedRecord,
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
    const fileImage = await checkRecordExists(id);
    if (!fileImage) {
      return responseUtil.error(res, "Bản ghi không tồn tại", 404);
    }

    await prisma.fileImage.delete({
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
