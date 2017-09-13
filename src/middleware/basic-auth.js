import User from '../models/user.js'
import createError from 'http-errors'

export default(req, res, next) => {
  let {authorization} = req.headers
  if(!authorization)
    return next(createError(401, 'AUTH ERROR: no authorization header'))

  let encoded = authorization.split('Basic ')[1]
  if(!encoded) {
    console.log('__SECURITY_WARNING__ Clientside validation bypassed: Basic authorization header has been tampered with')
    return next(createError(401, 'AUTH ERROR: not basic auth'))
  }

  let decoded = new Buffer(encoded, 'base64').toString()
  let [username, password] = decoded.split(':')
  if(!username || !password) {
    console.log('__SECURITY_WARNING__ Clientside validation bypassed: Username or password was missing from login request')
    return next(createError(401, 'AUTH ERROR: username or password missing'))
  }

  User.findOne({username})
    .then(user => {
      if(!user)
        throw createError(401, 'AUTH ERROR: user not found')
      return user.passwordHashCompare(password)
    })
    .then(user => {
      req.user = user
      next()
    })
    .catch(next)
}
