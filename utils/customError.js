class CustomError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode;
    this.statusMessage = `${this.statusCode}`.startsWith(4) ? 'Failed' : 'Error'
  }
}

module.exports = CustomError;