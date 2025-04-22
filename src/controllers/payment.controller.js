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

    // Lấy thông tin các tài liệu
    const documents = await prisma.document.findMany({
      where: { id: { in: document_ids.map(Number) }, status: "active" },
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

    // Transaction: Trừ tiền user, tạo Order, tạo referral_history nếu có
    const result = await prisma.$transaction(async (tx) => {
      // Trừ tiền user
      await tx.user.update({
        where: { id: Number(user_id) },
        data: { balance: { decrement: total_amount } },
      });

      // Tạo Order
      const order = await tx.order.create({
        data: {
          user_id: Number(user_id),
          total_amount,
          status: "pending",
          orderItems: {
            create: documents.map((doc) => ({
              document_id: doc.id,
              price: doc.price,
              status: "pending",
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
