import * as jwt from 'jsonwebtoken'
import createError from 'http-errors'

import User from '../models/user.js'
import * as util from '../lib/util.js'

export default (req, res, next) => {
  let {authorization} = req.headers
  if(!authorization)
    return next(createError(401, '__AUTH_ERROR__ No authorization header (bearerAuth)'))

  let token = authorization.split('Bearer ')[1]
  if(!token) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Bearer authorization header has been tampered with (bearerAuth)')
    return next(createError(401, '__AUTH_ERROR__ Not bearer auth (bearerAuth)'))
  }

  util.promisify(jwt.verify)(token, process.env.SECRET)
    .then(({randomHash}) => User.findOne({randomHash}))
    .then(user => {
      if(!user)
        throw createError(401, '__AUTH_ERROR__ User not found (bearerAuth)')
      req.user = user
      next()
    })
    .catch(err => createError(401, err))
}
