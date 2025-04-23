import prisma from "../prisma.js";
import responseUtil from "../utils/response.util.js";

const createPayment = async (req, res) => {
  try {
    const { document_ids, referral_code } = req.body; // nhận thêm referral_code
    const user_id = req.user?.id;

    if (!user_id) {
      return responseUtil.error(
        res,
        "Không xác định được người dùng",
        null,
        401
      );
    }
    if (!Array.isArray(document_ids) || document_ids.length === 0) {
      return responseUtil.error(
        res,
        "Danh sách tài liệu không hợp lệ",
        null,
        400
      );
    }

    // Check if user has already purchased any of these documents
    const existingOrders = await prisma.orderItem.findMany({
      where: {
        document_id: { in: document_ids },
        order: {
          user_id: Number(user_id),
          status: "active",
        },
        status: "active",
      },
    });

    if (existingOrders.length > 0) {
      // Get document names that user already purchased
      const purchasedDocuments = await prisma.document.findMany({
        where: {
          id: {
            in: existingOrders.map((order) => order.document_id),
          },
        },
        select: {
          title: true,
        },
      });

      const documentNames = purchasedDocuments
        .map((doc) => doc.title)
        .join(", ");

      return responseUtil.error(
        res,
        `Bạn đã mua các tài liệu trước đó rồi: ${documentNames}`,
        null,
        400
      );
    }

    // Lấy thông tin các tài liệu
    const documents = await prisma.document.findMany({
      where: { id: { in: document_ids.map(Number) }, status: "active" },
      include: { user: true }, // Include document owner information
    });

    if (documents.length !== document_ids.length) {
      return responseUtil.error(
        res,
        "Một số tài liệu không tồn tại hoặc không khả dụng",
        null,
        400
      );
    }

    // Tính tổng giá
    let total_amount = documents.reduce(
      (sum, doc) => sum + Number(doc.price),
      0
    );

    // Lấy thông tin user hiện tại
    const user = await prisma.user.findUnique({
      where: { id: Number(user_id) },
    });

    let referralUser = null;
    let commission_amount = 0;

    // Xử lý referral code nếu có nhập
    if (
      referral_code &&
      referral_code !== user.referral_code // không được là mã của chính mình
    ) {
      referralUser = await prisma.user.findFirst({
        where: {
          referral_code: referral_code,
          id: { not: Number(user_id) },
        },
      });

      if (referralUser) {
        // Giảm 5% tổng giá trị đơn hàng
        commission_amount = Math.round(total_amount * 0.05 * 100) / 100;
        total_amount = Math.round(total_amount * 0.95 * 100) / 100;
      }
    }

    // Kiểm tra số dư
    if (Number(user.balance) < total_amount) {
      return responseUtil.error(
        res,
        "Số dư tài khoản không đủ để thanh toán",
        null,
        400
      );
    }

    // Group documents by owner for easier processing
    const documentsByOwner = documents.reduce((acc, doc) => {
      const ownerId = doc.user.id;
      if (!acc[ownerId]) {
        acc[ownerId] = [];
      }
      acc[ownerId].push(doc);
      return acc;
    }, {});

    // Transaction: Trừ tiền user, cộng tiền cho chủ sở hữu, tạo Order, tạo referral_history nếu có
    const result = await prisma.$transaction(async (tx) => {
      // Trừ tiền user
      await tx.user.update({
        where: { id: Number(user_id) },
        data: { balance: { decrement: total_amount } },
      });

      // Cộng tiền cho các chủ sở hữu tài liệu
      for (const [ownerId, ownerDocs] of Object.entries(documentsByOwner)) {
        const ownerTotal = ownerDocs.reduce(
          (sum, doc) => sum + Number(doc.price),
          0
        );
        await tx.user.update({
          where: { id: Number(ownerId) },
          data: { balance: { increment: ownerTotal } },
        });
      }

      // Tạo Order
      const order = await tx.order.create({
        data: {
          user_id: Number(user_id),
          total_amount,
          status: "active",
          orderItems: {
            create: documents.map((doc) => ({
              document_id: doc.id,
              price: doc.price,
              status: "active",
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Nếu có referralUser, tạo referral_history
      if (referralUser) {
        await tx.referralHistory.create({
          data: {
            order_id: order.id,
            commission_amount: commission_amount,
            status: "active",
          },
        });
      }

      return order;
    });

    responseUtil.success(res, "Tạo đơn hàng thành công", result, 201);
  } catch (error) {
    responseUtil.error(res, "Xử lý thanh toán thất bại", error.message, 500);
  }
};

export default {
  createPayment,
};
