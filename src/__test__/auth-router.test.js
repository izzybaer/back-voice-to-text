require('dotenv').config({path: `${__dirname}/../.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import User from '../models/user.js'
import mockUser from './lib/mock-user.js'
import * as server from '../lib/server.js'

const API_URL = process.env.API_URL

describe('Testing Auth router', () => {

  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(cleanDB)

  describe('Testing registration', () => {
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
  })
})
