const express = require('express');
const { signup, login, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/driverAuthController');
const { signupValidator, loginValidator, resetPasswordValidator } = require('../utils/validation/driverAuthValidator');

const router = express.Router();


router.post('/signup', signupValidator, signup)
router.post('/login', loginValidator, login)

router.post('/forgotPassword', forgotPassword)
router.post('/verifyResetCode', verifyResetCode)
router.patch('/resetPassword', resetPasswordValidator, resetPassword)


module.exports = router