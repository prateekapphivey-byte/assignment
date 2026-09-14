const errorHandler = (err, req, res, next) => {
  console.error(err);

  
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID",
    });
  }

 
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message: `${field || "Field"} already exists`,
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message || "Internal server error",
  });
};

export default errorHandler;