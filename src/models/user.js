import mongoose from 'mongoose'
import {randomBytes} from 'crypto'
import createError from 'http-errors'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

import * as util from '../lib/util.js'

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  displayName: {type: String, required: true, unique: true},
  passwordHash: {type: String},
  tokenSeed: {type: String, default: ''},
})

userSchema.methods.passwordHashCompare = function(password) { // no arrow because of context
  console.log('passwordHashCompare')
  util.devLog('Password: ', password)

  return bcrypt.compare(password, this.passwordHash)
    .then(success => {
      if(!success)
        throw createError(401, '__AUTH_ERROR__ Wrong password (userSchema.methods.passwordHashCompare)')
      return this
    })
}

userSchema.methods.tokenCreate = function() { // no arrow because of context
  this.tokenSeed = randomBytes(32).toString('base64')
  return this.save()
    .then(user => jwt.sign({tokenSeed: this.tokenSeed}, process.env.SECRET))
    .then(token => token)
}

const User = mongoose.model('user', userSchema)

User.createFromSignup = user => {
  if(!user.username || !user.displayName || !user.password) {
    util.securityWarning('Clientside validation bypassed', 'A field is missing', user, 'User.createFromSignup', null)
    return Promise.reject(
      createError(400, '__AUTH_ERROR__ Missing fields for new user (User.createFromSignup)'))
  }

  let {password} = user
  user = {
    ...user,
    password: undefined, // remove password from user to be replaced by passwordHash
  }

  return bcrypt.hash(password, 1)
    .then(passwordHash => {
      let data = {
        ...user,
        passwordHash,
      }
      return new User(data).save()
    })
}

// Find the user data based on a bearer token
User.fromToken = token =>
  util.promisify(jwt.verify)(token, process.env.SECRET)
    .then(({tokenSeed}) => User.findOne({tokenSeed}))
    .then(user => {
      if(!user)
        throw createError(401, '__AUTH_ERROR__ User not found (User.fromToken)')
      return user
    })

export default User
