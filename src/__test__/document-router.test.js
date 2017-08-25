require('dotenv').config({path: `${__dirname}/../.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import mockDocument from './lib/mock-document.js'
import * as server from '../lib/server.js'

const API_URL = process.env.API_URL

describe('Testing Document router', () => {

  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(cleanDB)

  describe('Testing bad route', () => {
    test('It should return 404 not found', () => {
      return superagent.get(`${API_URL}/fake`)
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(404)
        })
    })
  })

  describe('Testing POST /document', () => {
    test('It should return 200 and the sent document from mongo', () => {
      return superagent.post(`${API_URL}/document`)
        .send({
          title: 'Mockument',
          description: 'Mockuscription. This one was not as cool',
          body: 'Here is me talking to a class during a lecture and stuff',
        })
        .then(document => {
          expect(document.body._id).toBeDefined()
          expect(document.body.title).toEqual('Mockument')
          expect(document.body.description).toEqual('Mockuscription. This one was not as cool')
          expect(document.body.body).toEqual('Here is me talking to a class during a lecture and stuff')
        })
    })

    test('It should return 400 bad request', () => {
      return superagent.post(`${API_URL}/document`)
        .send({})
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(400)
        })
    })
  })

  describe('Testing GET /document:id', () => {
    let tempDoc
    test('It should return 200 and a document from mongo', () => {
      return mockDocument.createOne()
        .then(mockedDoc => {
          tempDoc = mockedDoc
          return superagent.get(`${API_URL}/document/${tempDoc._id}`)
        })
        .then(gotDoc => {
          expect(gotDoc.body._id).toEqual(tempDoc._id.toString())
          expect(gotDoc.body.title).toEqual(tempDoc.title)
          expect(gotDoc.body.description).toEqual(tempDoc.description)
          expect(gotDoc.body.body).toEqual(tempDoc.body)
        })
    })
  })

  describe('Testing PUT /document/:id', () => {
    let tempDoc
    test('It should return 200 and a document from mongo', () => {
      return mockDocument.createOne()
        .then(mockedDoc => {
          tempDoc = mockedDoc
          return superagent.put(`${API_URL}/document/${tempDoc._id}`)
            .send({
              title: 'new title',
            })
        })
        .then(gotDoc => {
          expect(gotDoc.body._id).toEqual(tempDoc._id.toString())
          expect(gotDoc.body.title).toEqual('new title')
          expect(gotDoc.body.description).toEqual(tempDoc.description)
          expect(gotDoc.body.body).toEqual(tempDoc.body)
        })
    })

    test('It should return 400 bad request', () => {
      return mockDocument.createOne()
        .then(mockedDoc => {
          tempDoc = mockedDoc
          return superagent.put(`${API_URL}/document/${tempDoc._id}`)
            .send({
              _id: 'sdfasdfasd',
            })
        })
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(400)
        })
    })
  })

  describe('Testing DELETE /document/:id', () => {
    let tempDoc
    test('It should return 204 and delete a document from mongo', () => {
      return mockDocument.createOne()
        .then(mockedDoc => {
          tempDoc = mockedDoc
          return superagent.delete(`${API_URL}/document/${tempDoc._id}`)
        })
        .then(res => {
          expect(res.status).toEqual(204)
          return superagent.get(`${API_URL}/document/${tempDoc._id}`)
        })
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(404)
        })
    })
  })

})
