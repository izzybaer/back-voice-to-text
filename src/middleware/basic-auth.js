import createError from 'http-errors'

import User from '../models/user.js'
import * as util from '../lib/util.js'

export default (req, res, next) => {
  let {authorization} = req.headers
  if(!authorization)
    return next(createError(401, '__AUTH_ERROR__ No authorization header (basicAuth)'))

  let encoded = authorization.split('Basic ')[1]
  if(!encoded) {
    util.securityWarning('Clientside validation bypassed', 'Basic authorization header has been tampered with', authorization, 'basicAuth')
    return next(createError(401, '__AUTH_ERROR__ Not basic auth (basicAuth)'))
  }

  let decoded = util.atob(encoded)
  let [username, password] = decoded.split(':')
  if(!username || !password) {
    util.securityWarning('Clientside validation bypassed', 'Username or password was missing from login request', decoded, 'basicAuth')
    return next(createError(401, '__AUTH_ERROR__ Username or password missing (basicAuth)'))
  }

  // Try to find the user decoded from the Base64 text
  User.findOne({username})
    .then(user => {
      if(!user)
        throw createError(401, '__AUTH_ERROR__ User not found (basicAuth)')
      return user.passwordHashCompare(password)
    })
    .then(user => {
      req.user = user // Put the found user onto the request and move to the next module
      next()
    })
    .catch(next)
}
