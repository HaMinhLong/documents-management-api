import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileTypeFromFile } from "file-type";
import libre from "libreoffice-convert";

const getDocumentPreview = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy tài liệu từ database
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        subject: true,
        university: true,
        fileImages: true,
      },
    });

    if (!document) {
      return responseUtil.error(res, "Tài liệu không tồn tại", null, 404);
    }

    // Kiểm tra file_path
    const filePath = path.resolve(document.file_path);
    if (!fs.existsSync(filePath)) {
      return responseUtil.error(res, "File tài liệu không tồn tại", null, 404);
    }

    // Kiểm tra định dạng file
    const fileType = await fileTypeFromFile(filePath);
    const mimeType = fileType?.mime;

    let pdfBytes;

    if (mimeType === "application/pdf") {
      // Nếu là PDF, đọc trực tiếp
      pdfBytes = fs.readFileSync(filePath);
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // DOCX
      mimeType === "application/msword" // DOC
    ) {
      // Nếu là DOC hoặc DOCX, chuyển đổi sang PDF
      const docBuffer = fs.readFileSync(filePath);
      pdfBytes = await new Promise((resolve, reject) => {
        libre.convert(docBuffer, ".pdf", undefined, (err, pdfBuffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(pdfBuffer);
          }
        });
      });
    } else {
      return responseUtil.error(
        res,
        "Định dạng file không được hỗ trợ (chỉ hỗ trợ PDF, DOC, và DOCX)",
        null,
        400
      );
    }

    // Tải PDF và cắt 5 trang đầu
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const previewDoc = await PDFDocument.create();
    const pageCount = Math.min(pdfDoc.getPageCount(), 5);
    const pages = await previewDoc.copyPages(pdfDoc, [
      ...Array(pageCount).keys(),
    ]);

    for (const page of pages) {
      previewDoc.addPage(page);
    }

    // Lưu file preview tạm thời
    const previewBytes = await previewDoc.save();
    const previewFileName = `preview_${id}_${Date.now()}.pdf`;
    const previewFilePath = path.resolve("uploads", previewFileName);
    fs.writeFileSync(previewFilePath, previewBytes);

    // Trả về URL preview
    const previewUrl = `${process.env.REACT_APP_SEVER_URL}/uploads/${previewFileName}`;
    responseUtil.success(res, "Lấy preview thành công", { previewUrl }, 200);
  } catch (error) {
    responseUtil.error(res, "Lấy preview thất bại", error.message, 500);
  }
};

const createRecord = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      subject_id,
      university_id,
      status,
      category_ids,
    } = req.body; // Added category_ids to the destructured body
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

    if (category_ids) {
      const categories = category_ids.split(",").map((id) => ({
        document_id: document.id,
        category_id: parseInt(id),
      }));

      await prisma.documentCategory.createMany({
        data: categories,
      });
    }

    const [totalDocuments, user] = await Promise.all([
      prisma.document.count({ where: { user_id: parseInt(user_id) } }),
      prisma.user.findUnique({ where: { id: parseInt(user_id) } }),
    ]);

    const totalBalance = user.balance || 0;

    let level = "Silver";

    if (totalBalance > 5000000 || totalDocuments >= 100) {
      level = "Diamond";
    } else if (
      (totalBalance >= 3000000 && totalBalance < 5000000) ||
      totalDocuments >= 50
    ) {
      level = "Platinum";
    } else if (
      (totalBalance >= 1000000 && totalBalance < 3000000) ||
      totalDocuments >= 1
    ) {
      level = "Gold";
    }

    await prisma.user.update({
      where: { id: parseInt(user_id) },
      data: { level },
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
    name,
    status,
  } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (!req.user) {
    where.status = "active";
  } else if (user_id && req.user.role !== "ADMIN") {
    const parsedUserId = parseInt(user_id);

    where.user_id = parsedUserId;
  }

  if (status) {
    where.status = status;
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

  if (name) {
    where.title = { contains: name, mode: "insensitive" };
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
        orderItems: {
          include: {
            order: {
              include: {
                user: true,
              },
            },
          },
        },
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
    const {
      title,
      description,
      price,
      subject_id,
      university_id,
      category_ids,
      status,
    } = req.body;

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

    // Handle document categories
    if (category_ids) {
      const categories = category_ids.split(",").map((category_id) => ({
        document_id: parseInt(id),
        category_id: parseInt(category_id),
      }));

      // Delete existing categories
      await prisma.documentCategory.deleteMany({
        where: {
          document_id: parseInt(id),
        },
      });

      // Create new categories
      await prisma.documentCategory.createMany({
        data: categories,
      });
    }

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
    // Delete associated DocumentCategory records
    await prisma.documentCategory.deleteMany({
      where: {
        document_id: parseInt(id),
      },
    });

    await prisma.fileImage.deleteMany({
      where: {
        document_id: parseInt(id),
      },
    });

    // Now delete the Document
    await prisma.document.delete({
      where: {
        id: parseInt(id),
      },
    });

    responseUtil.success(res, "Xoá bản ghi thành công", 204);
  } catch (error) {
    responseUtil.error(res, "Xóa bản ghi thất bại", error.message, 500);
  }
};

// Lấy 5 tài liệu có lượt xem cao nhất
const getTopViewedDocuments = async (req, res) => {
  try {
    const topDocuments = await prisma.document.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        view_count: "desc",
      },
      take: 5,
      include: {
        user: true,
        subject: true,
        university: true,
        fileImages: true,
      },
    });

    responseUtil.success(
      res,
      "Lấy 5 tài liệu có lượt xem cao nhất thành công",
      {
        data: topDocuments,
      },
      200
    );
  } catch (error) {
    responseUtil.error(
      res,
      "Lấy 5 tài liệu có lượt xem cao nhất thất bại",
      error.message,
      500
    );
  }
};

const getPurchasedDocuments = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return responseUtil.error(
        res,
        "Không xác định được người dùng",
        null,
        401
      );
    }

    // Get all active orders for the user
    const orders = await prisma.order.findMany({
      where: {
        user_id: Number(user_id),
        status: "active",
      },
      select: { id: true },
    });

    const orderIds = orders.map((order) => order.id);

    if (orderIds.length === 0) {
      return responseUtil.success(
        res,
        "Không có tài liệu đã mua",
        { data: [] },
        200
      );
    }

    // Get all orderItems with their associated documents
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order_id: {
          in: orderIds,
        },
      },
      include: {
        document: {
          include: {
            user: true,
            subject: true,
            university: true,
            fileImages: true,
          },
        },
      },
    });

    // Filter out null documents and create unique list
    const purchasedDocuments = [
      ...new Set(
        orderItems.filter((item) => item.document).map((item) => item.document)
      ),
    ];

    responseUtil.success(
      res,
      "Lấy danh sách tài liệu đã mua thành công",
      { data: purchasedDocuments },
      200
    );
  } catch (error) {
    responseUtil.error(
      res,
      "Lấy danh sách tài liệu đã mua thất bại",
      error.message,
      500
    );
  }
};

export default {
  getDocumentPreview,
  createRecord,
  getRelatedDocuments,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getTopViewedDocuments,
  getPurchasedDocuments,
};
