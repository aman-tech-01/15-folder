export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Duplicate key error
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
