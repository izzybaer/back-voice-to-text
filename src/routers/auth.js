'use strict'
import {Router} from 'express'
import bodyParser from 'body-parser'
import basicAuth from '../middleware/basic-auth.js'

import User from '../models/user.js'
const jsonParser = bodyParser.json()
const authRouter = new Router()

authRouter.post('/auth', jsonParser, (req, res, next) => {
  let user = req.body
  console.log('__LOG__ POST to /auth')
  console.log('__LOG__ POST username', user.username)
  console.log('__LOG__ POST displayName', user.displayName)
  console.log('__LOG__ POST password', user.password)

  new User.createFromSignup(user)
    .then(user => user.tokenCreate())
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})


authRouter.get('/auth', basicAuth (req, res, next) => {
  req.user.tokenCreate()
    .then(token => {
      res.cookie('X-VtT-Token', token)
      res.send(token)
    })
    .catch(next)
})

export default authRouter
