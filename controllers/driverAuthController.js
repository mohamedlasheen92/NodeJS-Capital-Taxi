const crypto = require('crypto');
const CustomError = require('../utils/customError');
const Driver = require('../models/Driver');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');


/**
 * @description Signup a new user and issue a JWT
 * @route POST /api/v1/users/auth/signup
 * @access Public
 */
const signup = async (req, res, next) => {
  // Create a new driver
  const newDriver = await Driver.create(req.body);

  // Generate a token for the driver
  const token = await newDriver.generateJWT()

  // Send the token in the response
  res.status(201).json({ data: newDriver, token });
};

/**
 * @description Log in a user and issue a JWT token
 * @route POST /api/v1/users/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  // Find the user by email
  const driver = await Driver.findOne({ email: req.body.email });

  if (!driver || !(await driver.comparePassword(req.body.password)))
    return next(new CustomError('Incorrect email or password', 401));

  // Generate a token for the driver
  const token = await driver.generateJWT();

  // Send the token in the response
  res.json({ data: driver, token });
}

/**
 * @description Verify user authentication and attach user to request
 * @route Middleware
 * @access Protected
 */
const verifyDriverAuth = async (req, res, next) => {
  // Get token from the headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new CustomError('Unauthorized request. Token is not provided.', 401));

  // Verify token
  const payload = await Driver.verifyJWT(token)

  // Check if driver exists (account might be removed)
  const driver = await Driver.findById(payload.id)

  if (!driver)
    return next(new CustomError('Unauthorized request. Driver not found (account may be deleted).', 401));

  // Check if driver changed his password , if so login again
  if (driver.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(driver.passwordChangedAt.getTime() / 1000)
    if (passwordChangedTimestamp > payload.iat)
      return next(new CustomError('Driver has changed their password. Please log in again', 401));
  }

  // If all checks pass, attach the driver to the request
  req.driver = driver;

  next();
}

/**
 * @description Verify admin authentication and attach it to request
 * @route Middleware
 * @access Protected
 */
const verifyDriverAuthAdmin = async (req, res, next) => {
  // Get token from the headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new CustomError('Unauthorized request. Token is not provided.', 401));

  // Verify token
  const payload = await User.verifyJWT(token)

  // Check if admin exists (account might be removed)
  const admin = await User.findById(payload.id)

  if (!admin)
    return next(new CustomError('Unauthorized request. You are not allowed to access this route.', 401)); //Admin not found (account may be deleted).

  // Check if admin changed his password , if so login again
  if (admin.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(admin.passwordChangedAt.getTime() / 1000)
    if (passwordChangedTimestamp > payload.iat)
      return next(new CustomError('Driver has changed their password. Please log in again', 401));
  }

  // If all checks pass, attach the admin to the request
  req.user = admin;

  next();
}


/**
 * @description Verify user/driver roles and restrict access based on role permissions
 * @param {...string} roles - Allowed roles for accessing the route
 * @route Middleware
 * @access Protected
 */
const verifyDriverRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user ? req.user.role : req.driver.role))
    return next(new CustomError('You are not allowed to access this route.', 403));

  next()
}

/**
 * @description Handle the forgot password request by generating a reset code and sending it via email
 * @route POST /api/v1/drivers/auth/forgotPassword
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  // Get driver from gmail
  const driver = await Driver.findOne({ email: req.body.email });
  if (!driver)
    return next(new CustomError('No driver found with this email', 404));

  // Generate a reset code from 6 digits and hash it
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  driver.passwordResetCode = hashedResetCode

  // Expiration time for password reset code - Valid for 10 minutes
  driver.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  driver.passwordResetCodeVerified = false

  await driver.save()

  // Send the reset code via email
  const message = ` <div style="font-family: Arial, sans-serif; line-height: 1.5; text-align: center;"> 
  <p style="font-size: 16px;">Dear ${driver.name},</p> 
  <p style="font-size: 16px;">We received a request to reset your password. Please use the following code to reset your password:</p>
  <h2 style="font-size: 24px; color: #333;">${resetCode}</h2> 
  <p style="font-size: 16px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p> 
  <p style="font-size: 16px;">Best regards,</p> 
  <p style="font-size: 16px;">The Capital Taxi Team</p> 
  </div> `;
  try {
    await sendEmail({
      to: driver.email,
      subject: 'Password Reset Code',
      text: `Dear ${driver.name},\n\nWe received a request to reset your password. Please use the following code to reset your password:\n\n${resetCode}\n\nThis code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.\n\nBest regards,\nThe Capital Taxi Team`,
      html: message
    })
  } catch (err) {
    driver.passwordResetCode = undefined
    driver.passwordResetExpiresAt = undefined
    driver.passwordResetCodeVerified = undefined

    await driver.save()
    return next(new CustomError('Failed to send password reset code via email. Please try again later.', 500));
  }


  res.status(200).json({
    message: 'Password reset code sent to your email. Please check your inbox.'
  })
}

/**
 * @description Verify the password reset code provided by the driver
 * @route POST /api/v1/drivers/auth/verifyResetCode
 * @access Public
 */
const verifyResetCode = async (req, res, next) => {
  // Verify the hashed reset code and find the driver associated with it
  if (!req.body.resetCode)
    return next(new CustomError('Password reset code is required', 400))

  const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex')
  const driver = await Driver.findOne({ passwordResetCode: hashedResetCode })
  if (!driver)
    return next(new CustomError('Invalid password reset code', 400));

  if (driver.passwordResetExpiresAt < Date.now())
    return next(new CustomError('Password reset code has expired', 400));

  // Mark the password reset code as verified for the driver
  driver.passwordResetCodeVerified = true

  // Save the updated driver data to the database
  await driver.save()

  res.status(200).json({
    message: 'Password reset code verified. You can now change your password.'
  })
}

/**
 * @description Reset the driver's password after verifying the reset code and driver email
 * @route PATCH /api/v1/drivers/auth/resetPassword
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  const driver = await Driver.findOne({ email: req.body.email })

  if (!driver)
    return next(new CustomError('No driver found with this email', 404));

  if (!driver.passwordResetCodeVerified)
    return next(new CustomError('Password reset code not verified. Please verify the code and try again', 400));

  driver.password = req.body.newPassword;
  // driver.passwordChangedAt = Date.now();

  driver.passwordResetCode = undefined;
  driver.passwordResetExpiresAt = undefined;
  driver.passwordResetCodeVerified = undefined;

  await driver.save()

  // Generate a new JWT token for the driver
  const token = await driver.generateJWT()

  res.status(200).json({
    message: 'Password reset successful. You can now log in with your new password.',
    token
  })
}



module.exports = {
  signup,
  login,
  verifyDriverAuth,
  verifyDriverRoles,
  verifyDriverAuthAdmin,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};