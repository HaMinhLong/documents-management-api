import moment from "moment";
import crypto from "crypto";
import querystring from "qs";
import responseUtil from "../utils/response.util.js";
import prisma from "../prisma.js";

const config = {
  vnp_TmnCode: "HGI3ZFN4",
  vnp_HashSecret: "HR64UDTIOXE9M59QF2L833NKUPOTQNGI",
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_Api: "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
  vnp_ReturnUrl: "http://localhost:8000/api/v1/vnpay/return",
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const checkUserExists = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  return user;
};

const createPayment = (req, res) => {
  const paymentUrl = createPaymentRequest(req);

  console.log("paymentUrl", paymentUrl);

  responseUtil.success(res, "Success", { paymentUrl }, 201);
};

const createPaymentRequest = (req) => {
  const userId = req.user?.id;

  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let tmnCode = config.vnp_TmnCode;
  let secretKey = config.vnp_HashSecret;
  let vnpUrl = config.vnp_Url;
  let returnUrl = config.vnp_ReturnUrl;
  let orderId = moment(date).format("DDHHmmss");
  let amount = req.body.amount;

  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = `${orderId}_${userId}`;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);

  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

const checkCreateTransaction = async (req, res) => {
  try {
    const data = {
      user_id: 2,
      amount: 10000,
      type: undefined,
      status: "active",
      reference_id: undefined,
      description: undefined,
    };

    await prisma.transaction.create({
      data: data,
    });

    responseUtil.success(res, "Tạo bản ghi thành công", {}, 201);
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

const handlePaymentResponse = async (req, res) => {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  const tmnCode = config.vnp_TmnCode;
  const secretKey = config.vnp_HashSecret;

  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    const amount = (parseInt(vnp_Params["vnp_Amount"]) / 100).toLocaleString(
      "vi-VN"
    );

    let payDate = vnp_Params["vnp_PayDate"];
    let formattedDate = "";
    if (payDate && payDate.length === 14) {
      formattedDate = `${payDate.slice(0, 4)}-${payDate.slice(
        4,
        6
      )}-${payDate.slice(6, 8)} ${payDate.slice(8, 10)}:${payDate.slice(
        10,
        12
      )}:${payDate.slice(12, 14)}`;
    }

    const userId = vnp_Params["vnp_TxnRef"]?.split("_")?.[1];

    if (vnp_Params["vnp_ResponseCode"] === "00") {
      try {
        const user = await checkUserExists(userId);

        if (user) {
          const amountRecharge = parseInt(vnp_Params["vnp_Amount"]) / 100;
          await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
              ...user,
              balance: parseInt(Number(user.balance || 0) + amountRecharge),
            },
          });

          const transactionData = {
            user_id: parseInt(userId),
            amount: amountRecharge,
            type: undefined,
            status: "active",
            reference_id: undefined,
            description: undefined,
          };

          await prisma.transaction.create({
            data: transactionData,
          });
        } else {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
        }
      } catch (error) {
        return res.status(400).json({ error: error });
      }
    }

    res.render("success", {
      code: vnp_Params["vnp_ResponseCode"],
      vnp_TxnRef: vnp_Params["vnp_TxnRef"],
      amount,
      payDate: formattedDate,
    });
  } else {
    res.render("success", {
      code: "97",
      vnp_TxnRef: "-",
      amount: "-",
      payDate: "-",
    });
  }
};

export default {
  createPaymentRequest,
  createPayment,
  handlePaymentResponse,
  checkCreateTransaction,
};
