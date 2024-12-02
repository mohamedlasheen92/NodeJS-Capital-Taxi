const crypto = require('crypto');
const CustomError = require('../utils/customError');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');


/**
 * @description Signup a new user and issue a JWT
 * @route POST /api/v1/users/auth/signup
 * @access Public
 */
const signup = async (req, res, next) => {
  // Create a new user
  const newUser = await User.create(req.body);

  // Generate a token for the user
  const token = await newUser.generateJWT()

  // Send the token in the response
  res.status(201).json({ data: newUser, token });
};

/**
 * @description Log in a user and issue a JWT token
 * @route POST /api/v1/users/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  // Find the user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.comparePassword(req.body.password)))
    return next(new CustomError('Incorrect email or password', 401));

  // Generate a token for the user
  const token = await user.generateJWT();

  // Send the token in the response
  res.json({ data: user, token });
}

/**
 * @description Verify user authentication and attach user to request
 * @route Middleware
 * @access Protected
 */
const verifyUserAuth = async (req, res, next) => {
  // Get token from the headers
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new CustomError('Unauthorized request. Token is not provided.', 401));

  // Verify token
  const payload = await User.verifyJWT(token)

  // Check if user exists (account might be removed)
  const user = await User.findById(payload.id)

  if (!user)
    return next(new CustomError('Unauthorized request. User not found (account may be deleted).', 401));

  // Check if user changed his password , if so login again
  if (user.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000)
    if (passwordChangedTimestamp > payload.iat)
      return next(new CustomError('User has changed their password. Please log in again', 401));
  }

  // If all checks pass, attach the user to the request
  req.user = user;

  next();
}

/**
 * @description Verify user roles and restrict access based on role permissions
 * @param {...string} roles - Allowed roles for accessing the route
 * @route Middleware
 * @access Protected
 */
const verifyUserRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return next(new CustomError('You are not allowed to access this route.', 403));

  next()
}

/**
 * @description Handle the forgot password request by generating a reset code and sending it via email
 * @route POST /api/v1/users/auth/forgotPassword
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  // Get user from gmail
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new CustomError('No user found with this email', 404));

  // Generate a reset code from 6 digits and hash it
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  user.passwordResetCode = hashedResetCode

  // Expiration time for password reset code - Valid for 10 minutes
  user.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  user.passwordResetCodeVerified = false

  await user.save()

  // Send the reset code via email
  const message = ` <div style="font-family: Arial, sans-serif; line-height: 1.5; text-align: center;"> 
  <p style="font-size: 16px;">Dear ${user.name},</p> 
  <p style="font-size: 16px;">We received a request to reset your password. Please use the following code to reset your password:</p>
  <h2 style="font-size: 24px; color: #333;">${resetCode}</h2> 
  <p style="font-size: 16px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p> 
  <p style="font-size: 16px;">Best regards,</p> 
  <p style="font-size: 16px;">The Capital Taxi Team</p> 
  </div> `;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Code',
      text: `Dear ${user.name},\n\nWe received a request to reset your password. Please use the following code to reset your password:\n\n${resetCode}\n\nThis code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.\n\nBest regards,\nThe Capital Taxi Team`,
      html: message
    })
  } catch (err) {
    user.passwordResetCode = undefined
    user.passwordResetExpiresAt = undefined
    user.passwordResetCodeVerified = undefined

    await user.save()
    return next(new CustomError('Failed to send password reset code via email. Please try again later.', 500));
  }


  res.status(200).json({
    message: 'Password reset code sent to your email. Please check your inbox.'
  })
}

/**
 * @description Verify the password reset code provided by the user
 * @route POST /api/v1/users/auth/verifyResetCode
 * @access Public
 */
const verifyResetCode = async (req, res, next) => {
  // Verify the hashed reset code and find the user associated with it
  if (!req.body.resetCode)
    return next(new CustomError('Password reset code is required', 400))

  const hashedResetCode = crypto.createHash('sha256').update(req.body.resetCode).digest('hex')
  const user = await User.findOne({ passwordResetCode: hashedResetCode })
  if (!user)
    return next(new CustomError('Invalid password reset code', 400));

  if (user.passwordResetExpiresAt < Date.now())
    return next(new CustomError('Password reset code has expired', 400));

  // Mark the password reset code as verified for the user
  user.passwordResetCodeVerified = true

  // Save the updated user data to the database
  await user.save()

  res.status(200).json({
    message: 'Password reset code verified. You can now change your password.'
  })
}

/**
 * @description Reset the user's password after verifying the reset code and user email
 * @route PATCH /api/v1/users/auth/resetPassword
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user)
    return next(new CustomError('No user found with this email', 404));

  if (!user.passwordResetCodeVerified)
    return next(new CustomError('Password reset code not verified. Please verify the code and try again', 400));

  user.password = req.body.newPassword;
  // user.passwordChangedAt = Date.now();

  user.passwordResetCode = undefined;
  user.passwordResetExpiresAt = undefined;
  user.passwordResetCodeVerified = undefined;

  await user.save()

  // Generate a new JWT token for the user
  const token = await user.generateJWT()

  res.status(200).json({
    message: 'Password reset successful. You can now log in with your new password.',
    token
  })
}



module.exports = {
  signup,
  login,
  verifyUserAuth,
  verifyUserRoles,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};