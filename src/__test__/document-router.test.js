require('dotenv').config({path: `${__dirname}/../.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import mockDocument from './lib/mock-document.js'
import mockUser from './lib/mock-user.js'
import * as server from '../lib/server.js'

const API_URL = process.env.API_URL

describe('Testing Document router', () => {

  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(cleanDB)

  describe('Testing bad route', () => {
    test('It should return 404 not found', () =>
      superagent.get(`${API_URL}/fake`)
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(404)
        }))
  })

  describe('Testing POST /document', () => {
    test('It should return 200 and the sent document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          superagent.post(`${API_URL}/document`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({
              title: 'Mockument',
              description: 'Mockuscription. This one was not as cool',
              body: 'Here is me talking to a class during a lecture and stuff',
            })
            .then(document => {
              expect(document.body._id).toBeDefined()
              expect(document.body.ownerId).toEqual(user._id.toString())
              expect(document.body.title).toEqual('Mockument')
              expect(document.body.description).toEqual('Mockuscription. This one was not as cool')
              expect(document.body.body).toEqual('Here is me talking to a class during a lecture and stuff')
            })
        )
    )

    test('It should return 400 bad request', () =>
      mockUser.createOne()
        .then(user =>
          superagent.post(`${API_URL}/document`)
            .set('Authorization', `Bearer ${user.token}`)
            .send({})
            .then(res => {
              throw res
            })
            .catch(err => {
              expect(err.status).toEqual(400)
            })
        )
    )
  })

  describe('Testing GET /document and /document/:id', () => {
    let tempDoc
    test('It should return 200 and a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc => {
              tempDoc = mockedDoc
              return superagent.get(`${API_URL}/document/${tempDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
            })
            .then(gotDoc => {
              expect(gotDoc.body._id).toEqual(tempDoc._id.toString())
              expect(gotDoc.body.title).toEqual(tempDoc.title)
              expect(gotDoc.body.description).toEqual(tempDoc.description)
              expect(gotDoc.body.body).toEqual(tempDoc.body)
            })
        ))

    test('It should return 200 and all the documents in mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createMany(5, user._id)
            .then(() =>
              superagent.get(`${API_URL}/document`)
                .set('Authorization', `Bearer ${user.token}`))
            .then(docs => {
              expect(docs.body).toBeInstanceOf(Array)
              expect(docs.body.length).toEqual(5)
              expect(docs.body[2].title).toBeDefined()
              expect(docs.body[2].description).toBeDefined()
              expect(docs.body[2].body).toBeDefined()
            })
        )
    )
  })

  describe('Testing PUT /document/:id', () => {
    let tempDoc
    test('It should return 200 and a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc => {
              tempDoc = mockedDoc
              return superagent.put(`${API_URL}/document/${tempDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                  title: 'new title',
                })
            })
            .then(gotDoc => {
              expect(gotDoc.body._id).toEqual(tempDoc._id.toString())
              expect(gotDoc.body.ownerId).toEqual(user._id.toString())
              expect(gotDoc.body.title).toEqual('new title')
              expect(gotDoc.body.description).toEqual(tempDoc.description)
              expect(gotDoc.body.body).toEqual(tempDoc.body)
            })
        )
    )

    test('It should return 400 bad request', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc => {
              tempDoc = mockedDoc
              return superagent.put(`${API_URL}/document/${tempDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
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
        )
    )
  })

  describe('Testing DELETE /document/:id', () => {
    let tempDoc
    test('It should return 204 and delete a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc => {
              tempDoc = mockedDoc
              return superagent.delete(`${API_URL}/document/${tempDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
            })
            .then(res => {
              expect(res.status).toEqual(204)
              return superagent.get(`${API_URL}/document/${tempDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
            })
            .then(res => {
              throw res
            })
            .catch(err => {
              expect(err.status).toEqual(404)
            })
        )
    )
  })
})
