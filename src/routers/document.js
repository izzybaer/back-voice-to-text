'use strict'

import {Router} from 'express'

import Document from '../models/document.js'

import bodyParser from 'body-parser'
const jsonParser = bodyParser.json()

const documentRouter = new Router()

documentRouter.post('/document', jsonParser, (req, res, next) => {
  let doc = req.body
  console.log('__LOG__ POST to /document')
  console.log('__LOG__ POST title', doc.title)
  console.log('__LOG__ POST description', doc.description)
  console.log('__LOG__ POST body', doc.body)

  new Document({
    title: doc.title,
    description: doc.description,
    body: doc.body,
  })
    .save()
    .then(document => res.json(document))
    .catch(next)
})


documentRouter.get('/document/:id', (req, res, next) => {
  let docId = req.params.id
  console.log('__LOG__ GET document id', docId)

  Document.findById(docId)
    .then(document => document ? res.json(document) : res.sendStatus(404))
    .catch(next)
})

documentRouter.get('/document', (req, res, next) => {
  console.log('__LOG__ GET all docs')

  Document.find({})
    .then(documents => res.json(documents))
    .catch(next)
})

documentRouter.put('/document/:id', jsonParser, (req, res, next) => {
  let docId = req.params.id
  let newDoc = req.body
  console.log('__LOG__ PUT document id', docId)
  console.log('__LOG__ PUT new doc', newDoc)

  Document.findByIdAndUpdate(docId, req.body, {new: true, runValidators: true})
    .then(document => res.json(document))
    .catch(next)
})

documentRouter.delete('/document/:id', (req, res, next) => {
  let docId = req.params.id
  console.log('__LOG__ DELETE document id', docId)

  Document.findByIdAndRemove(docId)
    .then(() => res.sendStatus(204))
    .catch(next)
})

export default documentRouter
