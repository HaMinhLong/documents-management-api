const responseUtil = {
  success: (res, message, data = null, statusCode = 200) => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, message, error = null, statusCode = 400) => {
    res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error,
    });
  },
};

export default responseUtil;
