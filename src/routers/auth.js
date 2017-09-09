'use strict'
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
  console.log('__LOG__ POST to /auth')
  console.log('__LOG__ POST username', user.username)
  console.log('__LOG__ POST displayName', user.displayName)
  console.log('__LOG__ POST password', user.password)

  if(!user.username || !user.displayName || !user.password) {
    console.error('__WARNING__ Clientside validation bypassed: All fields are required (Register)')
    return res.sendStatus(400)
  }
  if(!/^[\w]+$/.test(user.displayName)) {
    console.error('__WARNING__ Clientside validation bypassed: Display Name has characters that aren\'t allowed (Register)')
    return res.sendStatus(400)
  }
  if(user.password.length < 8) {
    console.error('__WARNING__ Clientside validation bypassed: Password too short (Register)')
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
  if(!req.body.username || !req.body.password) {
    console.error('__WARNING__ Clientside validation bypassed: All fields are required (Login)')
    return res.sendStatus(400)
  }

  req.user.tokenCreate()
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

authRouter.post('/newPass', bearerAuth, jsonParser, (req, res, next) => {
  if(!req.body.oldPassword || !req.body.newPassword) {
    console.error('__WARNING__ Clientside validation bypassed: All fields are required (Change Password)')
    return res.sendStatus(400)
  }
  if(req.body.oldPassword.length < 8 || req.body.newPassword.length < 8) {
    console.error('__WARNING__ Clientside validation bypassed: Password too short (Change Password)')
    return res.sendStatus(400)
  }

  User.fromToken(req.headers.authorization.split('Bearer ')[1])
    .then(user => {
      return user.passwordHashCompare(req.body.oldPassword)
    })
    .then(user => bcrypt.hash(req.body.newPassword, 1)
      .then(passwordHash => User.findOneAndUpdate({username: user.username}, {passwordHash}, {runValidators: true, new: true})))
    .then(user => {
      res.sendStatus(200)
    })
    .catch(next)
})

export default authRouter
