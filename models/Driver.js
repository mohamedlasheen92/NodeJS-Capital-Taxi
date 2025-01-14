const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { promisify } = require('util')
const jwt = require('jsonwebtoken');

const signJWT = promisify(jwt.sign)
const verifyJWT = promisify(jwt.verify)

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    minlength: [3, 'Minimum length should be 3 characters'],
    maxlength: [20, 'Maximum length should be 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: [6, 'Minimum length should be 6 characters'],
    // select: false // will not be included in query results by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    minlength: [10, 'Minimum length should be 10 characters'],
    maxlength: [15, 'Maximum length should be 15 characters'],
  },

  // profileImage: {
  //   type: String,
  //   default: 'profile-driver.png'
  // },
  role: {
    type: String,
    enum: ['driver'],
    default: 'driver'
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: {    // [longitude, latitude]
      type: [Number],
    }
  },
  // drivingLicense: { type: String, required: true },
  // carLicense: { type: String, required: true },
  // carColor: { type: String, required: true },
  // carLicensePlateNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  ratingsAverage: {
    type: Number,
    min: [1, 'The Minimum of product ratings average is 1.0'],
    max: [5, 'The Maximum of product ratings average is 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },


  passwordChangedAt: { type: Date },
  passwordResetCode: { type: String },
  passwordResetExpiresAt: { type: Date },
  passwordResetCodeVerified: { type: Boolean }

}, { timestamps: true });

driverSchema.index({ location: "2dsphere" });



driverSchema.pre('save', async function () {
  const currentDoc = this
  if (currentDoc.isModified('password')) {
    // Hash the password before saving
    currentDoc.password = await bcrypt.hash(currentDoc.password, Number(process.env.SALT_ROUNDS))
  }
})

driverSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password)
}

driverSchema.methods.generateJWT = function () {
  const currentDocument = this;
  return signJWT({ id: currentDocument._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_AT })
}
driverSchema.statics.verifyJWT = function (token) {
  return verifyJWT(token, process.env.JWT_SECRET_KEY)
}


const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver