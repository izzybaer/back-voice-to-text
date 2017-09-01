'use strict'

import {Router} from 'express'

import bodyParser from 'body-parser'
const jsonParser = bodyParser.json()

const authRouter = new Router()

authRouter.post('/auth', jsonParser, (req, res, next) => {
  let doc = req.body
  console.log('__LOG__ POST to /document')
  console.log('__LOG__ POST title', doc.title)
  console.log('__LOG__ POST description', doc.description)
  console.log('__LOG__ POST body', doc.body)

  new User({
    username: doc.username,
    displayName: doc.displayName,
    password: doc.password,
  })
    .save()
    .then(document => res.json(document))
    .catch(next)
})


authRouter.get('/auth', (req, res, next) => {
  let docId = req.params.id
  console.log('__LOG__ GET document id', docId)

  Document.findById(docId)
    .then(document => document ? res.json(document) : res.sendStatus(404))
    .catch(next)
})

export default authRouter
