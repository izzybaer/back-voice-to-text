import {Router} from 'express'
import bodyParser from 'body-parser'
import * as bcrypt from 'bcrypt'

import User from '../models/user.js'
import basicAuth from '../middleware/basic-auth.js'
import bearerAuth from '../middleware/bearer-auth.js'

const jsonParser = bodyParser.json()
const authRouter = new Router()

authRouter.post('/auth', jsonParser, (req, res, next) => {
  let user = req.body
  console.log('__LOG__ POST /auth register user', user)

  if(!user.username || !user.displayName || !user.password) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: All fields are required (Register)')
    return res.sendStatus(400)
  }
  if(!/^[\w]+$/.test(user.displayName)) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Display Name has characters that aren\'t allowed (Register)')
    return res.sendStatus(400)
  }
  if(user.password.length < 8) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Password too short (Register)')
    return res.sendStatus(400)
  }

  new User.createFromSignup(user)
    .then(user => user.tokenCreate())
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})


authRouter.get('/auth', basicAuth, (req, res, next) => {
  console.log('__LOG__ GET /auth login', req.body)
  req.user.tokenCreate()
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

authRouter.put('/auth', bearerAuth, jsonParser, (req, res, next) => {
  console.log('__LOG__ PUT /auth password change', req.body)
  if(!req.body.oldPassword || !req.body.newPassword) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: All fields are required (Change Password)')
    return res.sendStatus(400)
  }
  if(req.body.oldPassword.length < 8 || req.body.newPassword.length < 8) {
    console.error('__SECURITY_WARNING__ Clientside validation bypassed: Password too short (Change Password)')
    return res.sendStatus(400)
  }

  User.fromToken(req.headers.authorization.split('Bearer ')[1])
    .then(user => user.passwordHashCompare(req.body.oldPassword))
    .then(user => bcrypt.hash(req.body.newPassword, 1)
      .then(passwordHash => User.findOneAndUpdate({username: user.username}, {passwordHash})))
    .then(user => {
      res.sendStatus(200)
    })
    .catch(next)
})

authRouter.get('/verify/:id', (req, res, next) => {
  let token = req.params.id
  console.log('__LOG__ GET token verification', token)

  User.fromToken(token)
    .then(user => res.json(user))
    .catch(() => res.sendStatus(401))
})

export default authRouter
