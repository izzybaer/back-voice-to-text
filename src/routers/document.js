import {Router} from 'express'
import bodyParser from 'body-parser'

import User from '../models/user.js'
import Document from '../models/document.js'
import bearerAuth from '../middleware/bearer-auth.js'

const jsonParser = bodyParser.json()
const documentRouter = new Router()

// Add a new document
documentRouter.post('/document', bearerAuth, jsonParser, (req, res, next) => {
  let doc = req.body
  console.log('__LOG__ POST /document new document', doc)
  console.log('__LOG__ POST /document ownerId', req.user._id)

  new Document({...doc, ownerId: req.user._id})
    .save()
    .then(document => res.json(document))
    .catch(next)
})

// View a specific document
documentRouter.get('/document/:id', bearerAuth, (req, res, next) => {
  let docId = req.params.id
  console.log('__LOG__ GET /document/:id', docId)

  Document.findById(docId)
    .then(document => document ? res.json(document) : res.sendStatus(404)) // It might hit this .then block even if it doesn't find a valid doc, so check to make sure before sending back to the user
    .catch(next)
})

// View all documents
documentRouter.get('/document', bearerAuth, (req, res, next) => {
  console.log('__LOG__ GET /document all docs')

  Document.find({})
    .sort({title: 'asc'})
    .then(documents => res.json(documents))
    .catch(next)
})

// Update a document
documentRouter.put('/document/:id', bearerAuth, jsonParser, (req, res, next) => {
  let docId = req.params.id
  let newDoc = req.body
  console.log('__LOG__ PUT /document/:id', docId)
  console.log('__LOG__ PUT /document/:id new doc', newDoc)

  Document.findByIdAndUpdate(docId, req.body, {new: true, runValidators: true})
    .then(document => res.json(document))
    .catch(next)
})

// Delete a document
documentRouter.delete('/document/:id', bearerAuth, (req, res, next) => {
  let docId = req.params.id
  console.log('__LOG__ DELETE /document/:id id', docId)

  Document.findByIdAndRemove(docId)
    .then(() => res.sendStatus(204))
    .catch(next)
})

export default documentRouter
