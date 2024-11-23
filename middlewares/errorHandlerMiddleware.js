const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.statusMessage = err.statusMessage || 'Error'

  res.status(err.statusCode).json({
    statusMessage: err.statusMessage,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

module.exports = errorHandler