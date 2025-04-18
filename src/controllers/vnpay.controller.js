import axios from "axios";
import responseUtil from "../utils/response.util.js";
import crypto from "crypto";

const VNPAY_URL = process.env.VNPAY_URL;
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE;
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET;

const createPayment = (req, res) => {
  const { orderId, amount, returnUrl } = req.body;
  const paymentUrl = createPaymentRequest(orderId, amount, returnUrl, req, res);
  res.redirect(paymentUrl);
};

const createPaymentRequest = (orderId, amount, returnUrl, req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("object", ip);
  const vnpParams = {
    vnp_Version: "2.0.0",
    vnp_Command: "pay",
    vnp_Tmn_Code: VNPAY_TMN_CODE,
    vnp_Amount: amount * 100,
    vnp_Curr_Code: "VND",
    vnp_Txn_Date: new Date().toISOString().replace(/[-:]/g, "").split(".")[0],
    vnp_Order_Info: "Thanh toán đơn hàng " + orderId,
    vnp_Order_Type: "other",
    vnp_ReturnUrl: returnUrl,
    vnp_Locale: "vn",
    vnp_Ip_Address: ip,
  };

  const sortedKeys = Object.keys(vnpParams).sort();
  const signData = sortedKeys
    .map((key) => `${key}=${vnpParams[key]}`)
    .join("&");
  const hash = crypto
    .createHmac("sha512", VNPAY_HASH_SECRET)
    .update(signData)
    .digest("hex");
  vnpParams.vnp_SecureHash = hash;
  const queryString = new URLSearchParams(vnpParams).toString();

  console.log("queryString", queryString);

  responseUtil.success(
    res,
    "Thành công",
    {
      data: `${VNPAY_URL}?${queryString}`,
    },
    200
  );
};

const handlePaymentResponse = (req, res) => {
  const vnpResponse = req.body;
  const secureHash = vnpResponse.vnp_SecureHash;
  delete vnpResponse.vnp_SecureHash;

  const sortedKeys = Object.keys(vnpResponse).sort();
  const signData = sortedKeys
    .map((key) => `${key}=${vnpResponse[key]}`)
    .join("&");
  const hash = crypto
    .createHmac("sha512", VNPAY_HASH_SECRET)
    .update(signData)
    .digest("hex");

  if (secureHash === hash) {
    console.log("Thanh toán thành công:", vnpResponse);
    res.send("Thanh toán thành công");
  } else {
    console.log("Thanh toán thất bại:", vnpResponse);
    res.send("Thanh toán thất bại");
  }
};

export default { createPaymentRequest, createPayment, handlePaymentResponse };
