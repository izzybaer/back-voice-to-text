import {Router} from 'express'
import bodyParser from 'body-parser'
import * as bcrypt from 'bcrypt'

import User from '../models/user.js'
import basicAuth from '../middleware/basic-auth.js'
import bearerAuth from '../middleware/bearer-auth.js'
import * as util from '../lib/util.js'

const jsonParser = bodyParser.json()
const authRouter = new Router()

// Register a user
authRouter.post('/auth', jsonParser, (req, res, next) => {
  let user = req.body
  let requestInfo = {
    headers: req.headers,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
  }
  console.log('__LOG__ POST /auth register user', {...user, password: null})
  util.devLog('User with password: ', user)
  console.log('Request Info', requestInfo)

  if(!user.username || !user.displayName || !user.password) {
    util.securityWarning('Clientside validation bypassed', 'A field is missing', user, 'authRouter.post /auth', requestInfo)
    return res.sendStatus(400)
  }
  if(!/^[\w]+$/.test(user.displayName)) {
    util.securityWarning('Clientside validation bypassed', 'Display Name has characters that aren\'t allowed', user, 'authRouter.post /auth', requestInfo)
    return res.sendStatus(400)
  }
  if(user.password.length < 8) {
    util.securityWarning('Clientside validation bypassed', 'Password too short', user, 'authRouter.post /auth', requestInfo)
    return res.sendStatus(400)
  }

  new User.createFromSignup(user)
    .then(user => user.tokenCreate())
    .then(token => {
      res.cookie('X-VtT-Username', user.username)
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

// Login a user
authRouter.get('/auth', basicAuth, (req, res, next) => {
  let requestInfo = {
    headers: req.headers,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
  }
  console.log('__LOG__ GET /auth login')
  console.log('Request Info', requestInfo)

  req.user.tokenCreate()
    .then(token => {
      res.cookie('X-VtT-Username', req.user.username)
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

// Change a users password
authRouter.put('/auth', bearerAuth, jsonParser, (req, res, next) => {
  let passwords = req.body
  let requestInfo = {
    headers: req.headers,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
  }
  console.log('__LOG__ PUT /auth password change')
  util.devLog('Passwords: ', passwords)
  console.log('Request Info', requestInfo)

  // Passwords shouldn't be logged here but the data is necessary for the security warning so I can see what was being sent in that bypassed the filter
  if(!passwords.oldPassword || !passwords.newPassword) {
    util.securityWarning('Clientside validation bypassed', 'A field is missing', passwords, 'authRouter.put /auth', requestInfo)
    return res.sendStatus(400)
  }
  if(passwords.oldPassword.length < 8 || passwords.newPassword.length < 8) {
    util.securityWarning('Clientside validation bypassed', 'Password too short', passwords, 'authRouter.put /auth', requestInfo)
    return res.sendStatus(400)
  }

  User.fromToken(req.headers.authorization.split('Bearer ')[1])
    .then(user => user.passwordHashCompare(passwords.oldPassword))
    .then(user => bcrypt.hash(passwords.newPassword, 1)
      .then(passwordHash => User.findOneAndUpdate({username: user.username}, {passwordHash})))
    .then(user => res.sendStatus(200))
    .catch(next)
})

// Verify a user belongs to the incoming token
authRouter.post('/verify', (req, res, next) => {
  let {token} = req.body
  let requestInfo = {
    headers: req.headers,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
  }
  console.log('__LOG__ GET /verify/:id token verification')
  util.devLog('Token: ', token)
  console.log('Request Info', requestInfo)

  User.fromToken(token)
    .then(user => {
      res.cookie('X-VtT-Username', user.username)
      res.json(user)
    })
    .catch(() => res.sendStatus(401))
})

export default authRouter
