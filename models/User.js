const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { promisify } = require('util')
const jwt = require('jsonwebtoken');

const signJWT = promisify(jwt.sign)
const verifyJWT = promisify(jwt.verify)

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username is required'],
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
  profileImage: {
    type: String,
    default: 'profile-user.png'
  },
  role: {
    type: String,
    enum: ['rider', 'admin'],
    default: 'rider'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: "Point"
    },
    coordinates: {    // [longitude, latitude]
      type: [Number],
      required: true
    }
  },
  passwordChangedAt: { type: Date },
  passwordResetCode: { type: String },
  passwordResetExpiresAt: { type: Date },
  passwordResetCodeVerified: { type: Boolean }

}, { timestamps: true })

userSchema.index({ location: "2dsphere" }); // Geospatial index for location




userSchema.pre('save', async function () {
  const currentDoc = this
  if (currentDoc.isModified('password')) {
    // Hash the password before saving
    currentDoc.password = await bcrypt.hash(currentDoc.password, Number(process.env.SALT_ROUNDS))
  }
})

userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password)
}

userSchema.methods.generateJWT = function () {
  const currentDocument = this;
  return signJWT({ id: currentDocument._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_AT })
}
userSchema.statics.verifyJWT = function (token) {
  return verifyJWT(token, process.env.JWT_SECRET_KEY)
}

const User = mongoose.model('User', userSchema);
module.exports = User;