const mongoose = require('mongoose')
const connection = mongoose.createConnection('mongodb://localhost/user', { useNewUrlParser: true })
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  videos: [String]
})

UserSchema.plugin(uniqueValidator)

UserSchema.methods.validPassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  bcrypt.hash(this.password, 12).then(hash => {
    this.password = hash
    next()
  })
})

const User = connection.model('User', UserSchema)
module.exports = User
