import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createRecord = async (req, res) => {
  try {
    const { title, description, price, subject_id, university_id, status } =
      req.body;
    const file_path = req.files?.file?.[0]?.path || null;
    const instruct_path = req.files?.instruct?.[0]?.path || null;
    const fileImages = req.files?.fileImages || [];

    const user_id = req.user?.id;

    if (!user_id) {
      return responseUtil.error(
        res,
        "Không xác định được người dùng",
        null,
        401
      );
    }

    // Tạo document
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
        status: status || "active",
        fileImages: {
          create: fileImages.map((file) => ({
            image_path: file.path,
            name: file.originalname,
            status: "active",
          })),
        },
      },
      include: {
        fileImages: true,
      },
    });

    responseUtil.success(res, "Tạo bản ghi thành công", document, 201);
  } catch (error) {
    responseUtil.error(res, "Xảy ra lỗi khi tạo bản ghi", error.message, 500);
  }
};

const getRelatedDocuments = async (req, res) => {
  const { subject_id, id, page = 1, limit = 4 } = req.query; // Lấy subject_id, id tài liệu hiện tại, page, limit
  const offset = (page - 1) * limit;

  try {
    // Kiểm tra subject_id và id
    if (!subject_id || !id) {
      return responseUtil.error(res, "Thiếu subject_id hoặc id", null, 400);
    }

    // Lấy danh sách tài liệu liên quan
    const documents = await prisma.document.findMany({
      where: {
        subject_id: parseInt(subject_id), // Tài liệu có cùng subject_id
        id: { not: parseInt(id) }, // Loại trừ tài liệu hiện tại
        status: "active", // Chỉ lấy tài liệu công khai
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      include: {
        user: true,
        subject: true,
        university: true,
        fileImages: true, // Bao gồm hình ảnh để hiển thị ảnh demo
      },
    });

    // Tính tổng số tài liệu liên quan
    const totalRecords = await prisma.document.count({
      where: {
        subject_id: parseInt(subject_id),
        id: { not: parseInt(id) },
        status: "active",
      },
    });
    const totalPages = Math.ceil(totalRecords / limit);

    responseUtil.success(
      res,
      "Lấy danh sách tài liệu liên quan thành công",
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
    responseUtil.error(
      res,
      "Lấy danh sách tài liệu liên quan thất bại",
      error.message,
      500
    );
  }
};

const getRecords = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    user_id,
    subject_id,
    university_id,
    category_id,
  } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (!req.user) {
    where.status = "active";
  } else if (user_id && req.user.role !== "ADMIN") {
    const parsedUserId = parseInt(user_id);

    where.user_id = parsedUserId;
  }

  if (subject_id) {
    const parsedSubjectId = parseInt(subject_id);
    where.subject_id = parsedSubjectId;
  }

  if (university_id) {
    const parsedUniversityId = parseInt(university_id);
    where.university_id = parsedUniversityId;
  }

  if (category_id) {
    where.documentCategories = {
      some: {
        category_id: { in: [parseInt(category_id)] },
      },
    };
  }

  try {
    const documents = await prisma.document.findMany({
      where,
      skip: offset,
      take: parseInt(limit),
      include: {
        user: true,
        subject: true,
        university: true,
        documentCategories: {
          include: {
            category: true,
          },
        },
        fileImages: true,
      },
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
    // Kiểm tra tài liệu tồn tại
    const document = await checkRecordExists(id);
    if (!document) {
      return responseUtil.error(res, "Bản ghi không tồn tại", null, 404);
    }

    // Tăng view_count lên 1
    const updatedDocument = await prisma.document.update({
      where: { id: parseInt(id) },
      data: {
        view_count: {
          increment: 1, // Tăng view_count lên 1
        },
      },
      include: {
        user: true,
        subject: true,
        university: true,
        documentCategories: {
          include: {
            category: true,
          },
        },
        fileImages: true,
      },
    });

    responseUtil.success(
      res,
      "Lấy thông tin bản ghi thành công",
      updatedDocument,
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
    const { title, description, price, subject_id, university_id, status } =
      req.body;

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
    const fileImages = req.files?.fileImages || [];

    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) },
    });
    if (!document) {
      return responseUtil.error(res, "Tài liệu không tồn tại", null, 404);
    }

    const updateData = {
      title,
      description,
      price: parseFloat(price),
      user_id: parseInt(user_id),
      subject_id: parseInt(subject_id),
      university_id: parseInt(university_id),
      status,
      file_path: file_path || document.file_path,
      instruct_path: instruct_path || document.instruct_path,
      fileImages: {
        deleteMany: {},
        create: fileImages.map((file) => ({
          image_path: file.path,
          name: file.originalname,
          status: "active",
        })),
      },
    };

    const updatedDocument = await prisma.document.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        fileImages: true,
      },
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
  getRelatedDocuments,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
