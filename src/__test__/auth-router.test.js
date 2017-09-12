require('dotenv').config({path: `${__dirname}/../.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import User from '../models/user.js'
import mockUser from './lib/mock-user.js'
import * as server from '../lib/server.js'

const API_URL = process.env.API_URL

const btoa = text =>
  new Buffer(text.toString(), 'binary').toString('base64')

describe('Testing Auth router', () => {

  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(cleanDB)

  describe('Testing POST /auth registration', () => {
    test('It should return 200 and a token', () =>
      superagent.post(`${API_URL}/auth`)
        .send({
          username: 'tester',
          displayName: 'theTest',
          password: 'my pass is this',
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toBeDefined()
          return User.fromToken(res.text)
        })
        .then(user => {
          expect(user.username).toEqual('tester')
          expect(user.displayName).toEqual('theTest')
        })
    )

    test('It should return 400 bad request - missing fields', () =>
      superagent.post(`${API_URL}/auth`)
        .send({
          username: 'tester',
        })
        .then(res => {
          throw res
        })
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    )

    test('It should return 400 bad request - too short of pass', () =>
      superagent.post(`${API_URL}/auth`)
        .send({
          username: 'tester',
          displayName: 'testingMan',
          password: '12',
        })
        .then(res => {
          throw res
        })
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    )

    test('It should return 400 bad request - disallowed characters in display name', () =>
      superagent.post(`${API_URL}/auth`)
        .send({
          username: 'tester',
          displayName: '$up Dud3',
          password: '1111111111111',
        })
        .then(res => {
          throw res
        })
        .catch(res => {
          expect(res.status).toEqual(400)
        })
    )
  })

  describe('Testing GET /auth login', () => {
    test('It should return 200 and a token', () =>
      mockUser.createOne()
        .then(user => {
          let basic = btoa(`${user.username}:${user.password}`)
          return superagent.get(`${API_URL}/auth`)
            .set('Authorization', `Basic ${basic}`)
        })
        .then(res => {
          expect(res.status).toEqual(200)
          expect(res.text).toBeDefined()
        })
    )
  })
})