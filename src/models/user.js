import {randomBytes} from 'crypto'
import createError from 'http-errors'
import * as util from '../lib/util.js'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  passwordHash: {type: String},
  username: {type: String, required: true, unique: true},
  displayName: {type: String, required: true, unique: true},
  tokenSeed: {type: String, default: ''},
})

userSchema.methods.passwordHashCreate = function(password){
  console.log('passwordHashCreate', password)
  return bcrypt.hash(password, 8)
    .then(hash => {
      this.passwordHash = hash
      return this
    })
}

userSchema.methods.passwordHashCompare = function(password){
  console.log('passwordHashCompare', password)
  return bcrypt.compare(password, this.passwordHash)
    .then(success => {
      if(!success)
        throw createError(401, 'AUTH ERROR: wrong password')
      return this
    })
}

userSchema.methods.tokenCreate = function (){
  this.tokenSeed = randomBytes(32).toString('base64')
  return this.save()
    .then(user => {
      return jwt.sign({tokenSeed: this.tokenSeed}, process.env.SECRET)
    })
    .then(token => {
      return token
    })
}

const User = module.exports = mongoose.model('user', userSchema)

User.createFromSignup = function(user){
  if(!user.username || !user.displayName || !user.password)
    return Promise.reject(
      createError(400, '__SECURITY_WARNING__ Clientside validation bypassed: All fields are required (createFromSignup)'))

  let {password} = user
  user = Object.assign({}, user, {password: undefined})

  return bcrypt.hash(password, 1)
    .then(passwordHash => {
      let data = Object.assign({}, user, {passwordHash})
      return new User(data).save()
    })
}

User.fromToken = function(token){
  return util.promisify(jwt.verify)(token, process.env.SECRET)
    .then(({tokenSeed}) => User.findOne({tokenSeed}))
    .then((user) => {
      if(!user)
        throw createError(401, 'AUTH ERROR: user not found')
      return user
    })
}
