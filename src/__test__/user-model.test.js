import dotenv from 'dotenv'
dotenv.config({path: `.test.env`})

import User from '../models/user.js'
import cleanDB from './lib/clean-db.js'
import * as server from '../lib/server.js'

describe('Testing User Model/Schema', () => {
  beforeAll(server.start)
  afterAll(server.stop)
  afterEach(cleanDB)

  test('Testing createFromSignup', () => {
    let userCreds = {
      username: 'test user',
      displayName: 'im testing',
      password: 'testPassword',
    }

    return User.createFromSignup(userCreds)
      .then(user => {
        expect(user._id).toBeDefined()
        expect(user.username).toEqual(userCreds.username)
        expect(user.displayName).toEqual(userCreds.displayName)
        expect(user.passwordHash).toBeDefined()
      })
  })

  test('Testing tokenCreate', () => {
    let userCreds = {
      username: 'test user',
      displayName: 'im testing',
      password: 'testPassword',
    }

    return User.createFromSignup(userCreds)
      .then(user => user.tokenCreate())
      .then(token => {
        expect(token).toBeDefined()
      })
  })

  test('Testing fromToken', () => {
    let userCreds = {
      username: 'test user',
      displayName: 'im testing',
      password: 'testPassword',
    }

    return User.createFromSignup(userCreds)
      .then(user => user.tokenCreate())
      .then(token => User.fromToken(token))
      .then(user => {
        expect(user._id).toBeDefined()
        expect(user.username).toEqual(userCreds.username)
        expect(user.displayName).toEqual(userCreds.displayName)
        expect(user.passwordHash).toBeDefined()
        expect(user.tokenSeed).toBeDefined()
      })
  })

  test('Testing passwordHashCompare (with correct password)', () => {
    let userCreds = {
      username: 'test user',
      displayName: 'im testing',
      password: 'testPassword',
    }

    return User.createFromSignup(userCreds)
      .then(user => user.passwordHashCompare(userCreds.password))
      .then(user => {
        expect(user._id).toBeDefined()
        expect(user.username).toEqual(userCreds.username)
        expect(user.displayName).toEqual(userCreds.displayName)
        expect(user.passwordHash).toBeDefined()
      })
  })

  test('Testing passwordHashCompare (with wrong password)', () => {
    let userCreds = {
      username: 'test user',
      displayName: 'im testing',
      password: 'testPassword',
    }

    return User.createFromSignup(userCreds)
      .then(user => user.passwordHashCompare('the wrong pass'))
      .then(res => {
        throw res
      })
      .catch(err => {
        expect(err.message).toContain('Wrong password')
      })
  })
})
