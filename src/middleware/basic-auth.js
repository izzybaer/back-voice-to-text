import createError from 'http-errors'

import User from '../models/user.js'
import * as util from '../lib/util.js'

export default (req, res, next) => {
  let {authorization} = req.headers
  if(!authorization)
    return next(createError(401, '__AUTH_ERROR__ No authorization header (basicAuth)'))

  let encoded = authorization.split('Basic ')[1]
  if(!encoded) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Basic authorization header has been tampered with (basicAuth)')
    return next(createError(401, '__AUTH_ERROR__ Not basic auth (basicAuth)'))
  }

  let decoded = new Buffer(encoded, 'base64').toString()
  let [username, password] = decoded.split(':')
  if(!username || !password) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Username or password was missing from login request (basicAuth)')
    return next(createError(401, '__AUTH_ERROR__ Username or password missing (basicAuth)'))
  }

  User.findOne({username})
    .then(user => {
      if(!user)
        throw createError(401, '__AUTH_ERROR__ User not found (basicAuth)')
      return user.passwordHashCompare(password)
    })
    .then(user => {
      req.user = user
      next()
    })
    .catch(next)
}
