require('dotenv').config({path: `${__dirname}/../.test.env`})

import superagent from 'superagent'

import cleanDB from './lib/clean-db.js'
import mockDocument from './lib/mock-document.js'
import * as server from '../lib/server.js'

const API_URL = process.env.API_URL

describe('Testing Document router', () => {

  beforeEach(server.start)
  afterEach(server.stop)
  afterEach(cleanDB)

  describe('Testing POST /document', () => {
    test('It should return the sent document from mongo', () => {
      return superagent.post(`${API_URL}/document`)
        .send({
          title: 'Mockument',
          description: 'Mockuscription. This one was not as cool',
          body: 'Here is me talking to a class during a lecture and stuff',
        })
        .then(document => {
          console.log('returned document - POST', document)
          expect(document.title).toBe('Mockument')
          expect(document.description).toBe('Mockuscription. This one was not as cool')
          expect(document.body).toBe('Here is me talking to a class during a lecture and stuff')
        })
    })
  })

})
