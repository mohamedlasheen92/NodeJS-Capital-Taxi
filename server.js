// NPM Modules
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
require('express-async-errors')

// Configuration/Environment Variables
dotenv.config()

// Database Connection
const dbConnection = require('./config/database')
dbConnection()

// Helpers
const CustomError = require('./utils/customError');

// Middlewares
const errorHandler = require('./middlewares/errorHandlerMiddleware');

// Routes
const userRoutes = require('./routes/userRoutes')
const driverRoutes = require('./routes/driverRoutes')
const tripRoute = require('./routes/tripRoutes');
const reviewRoute = require('./routes/reviewRoutes');

const app = express();


// *** MIDDLEWARES
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
  console.log(`Mode: ${process.env.NODE_ENV}`);
}


// *** ROUTES
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/drivers', driverRoutes)
app.use('/api/v1/trips', tripRoute)
app.use('/api/v1/reviews', reviewRoute)


// *** UNHANDLED ROUTES
app.use((req, res, next) => {
  next(new CustomError('404: This route does not exist.', 404));
})


// *** GLOBAL ERROR HANDLER MIDDLEWARE FOR EXPRESS
app.use(errorHandler)


const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`Server in running on port ${port}`);
})

// GLOBAL HANDLER FOR UNHANDLED PROMISE REJECTIONS (OUTSIDE EXPRESS)
process.on('unhandledRejection', (reason) => {
  console.log(`Unhandled Rejection: ${reason.name}, ${reason.message}`);
  server.close(() => {
    console.log('Shutting down the server...');
    process.exit(1);  // Exit the process with an error code of 1
  })
})