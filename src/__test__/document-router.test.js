import dotenv from 'dotenv'
dotenv.config({path: `.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import mockDocument from './lib/mock-document.js'
import mockUser from './lib/mock-user.js'
import * as server from '../lib/server.js'

const {API_URL} = process.env

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
        })
    )
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

    test('It should return 400 bad request - fields missing', () =>
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

    test('It should return 401 unauthorized - no auth header', () =>
      superagent.post(`${API_URL}/document`)
        .send({
          title: 'title',
          description: 'description',
          body: 'body',
        })
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(401)
        })
    )
  })

  describe('Testing GET /document and /document/:id', () => {
    test('It should return 200 and a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc =>
              superagent.get(`${API_URL}/document/${mockedDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .then(gotDoc => {
                  expect(gotDoc.body._id).toEqual(mockedDoc._id.toString())
                  expect(gotDoc.body.title).toEqual(mockedDoc.title)
                  expect(gotDoc.body.description).toEqual(mockedDoc.description)
                  expect(gotDoc.body.body).toEqual(mockedDoc.body)
                })
            )
        )
    )

    test('It should return 200 and all the documents in mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createMany(5, user._id)
            .then(() =>
              superagent.get(`${API_URL}/document`)
                .set('Authorization', `Bearer ${user.token}`)
                .then(docs => {
                  expect(docs.body).toBeInstanceOf(Array)
                  expect(docs.body.length).toEqual(5)
                  expect(docs.body[2].title).toBeDefined()
                  expect(docs.body[2].description).toBeDefined()
                  expect(docs.body[2].body).toBeDefined()
                })
            )
        )
    )

    test('It should return 401 unauthorized - no auth header', () =>
      superagent.get(`${API_URL}/document/asdasdasd`)
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(401)
        })
    )
  })

  describe('Testing PUT /document/:id', () => {
    test('It should return 200 and a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc =>
              superagent.put(`${API_URL}/document/${mockedDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                  title: 'new title',
                })
                .then(gotDoc => {
                  expect(gotDoc.body._id).toEqual(mockedDoc._id.toString())
                  expect(gotDoc.body.ownerId).toEqual(user._id.toString())
                  expect(gotDoc.body.title).toEqual('new title')
                  expect(gotDoc.body.description).toEqual(mockedDoc.description)
                  expect(gotDoc.body.body).toEqual(mockedDoc.body)
                })
            )
        )
    )

    test('It should return 400 bad request - attempting to change _id', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc =>
              superagent.put(`${API_URL}/document/${mockedDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .send({
                  _id: 'sdfasdfasd',
                })
                .then(res => {
                  throw res
                })
                .catch(err => {
                  expect(err.status).toEqual(400)
                })
            )
        )
    )

    test('It should return 401 unauthorized - no auth header', () =>
      superagent.put(`${API_URL}/document/sdfgsdfgsdfg`)
        .send({
          title: 'new title',
          description: 'new description',
        })
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(401)
        })
    )
  })

  describe('Testing DELETE /document/:id', () => {
    test('It should return 204 and delete a document from mongo', () =>
      mockUser.createOne()
        .then(user =>
          mockDocument.createOne(user._id)
            .then(mockedDoc =>
              superagent.delete(`${API_URL}/document/${mockedDoc._id}`)
                .set('Authorization', `Bearer ${user.token}`)
                .then(res => {
                  expect(res.status).toEqual(204)
                  return superagent.get(`${API_URL}/document/${mockedDoc._id}`)
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
    )

    test('It should return 401 unauthorized - no auth header', () =>
      superagent.delete(`${API_URL}/document/asdasdasdasd`)
        .then(res => {
          throw res
        })
        .catch(err => {
          expect(err.status).toEqual(401)
        })
    )
  })
})
