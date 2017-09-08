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

  if(user.password.length < 8) {
    console.error('__ERROR__ Password length is less than 8')
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
  req.user.tokenCreate()
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

authRouter.post('/newPass', bearerAuth, jsonParser, (req, res, next) => {
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
