const mongoose = require('mongoose')
const connection = mongoose.createConnection('mongodb://localhost/user', { useNewUrlParser: true })
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  videos: [String]
})

UserSchema.plugin(uniqueValidator)

UserSchema.methods.validPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

UserSchema.virtual('password').set(function (value) {
  this.passwordHash = value
})

UserSchema.pre('save', async function () {
  await bcrypt.hash(this.passwordHash, 12)
})

const User = connection.model('User', UserSchema)
module.exports = User
