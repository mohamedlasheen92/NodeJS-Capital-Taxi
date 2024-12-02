const CustomError = require("../utils/customError")


const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.statusMessage = err.statusMessage || 'Error'

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      statusMessage: err.statusMessage,
      error: err,
      message: err.message,
      stack: err.stack
    })
  } else {
    if (err.name === 'JsonWebTokenError') err = new CustomError('Authentication failed. Token is invalid.', 401)
    else if (err.name === 'TokenExpiredError') err = new CustomError('Token expired. Please log in again', 401)
    res.status(err.statusCode).json({
      statusMessage: err.statusMessage,
      message: err.message,
    })
  }
}

module.exports = errorHandler