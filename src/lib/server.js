'use strict'
require('dotenv').config()

import cors from 'cors'
import io from './io.js'
import morgan from 'morgan'
import {Server} from 'http'
import express from 'express'
import * as mongo from './mongo.js'

import documentRouter from '../routers/document.js'
import four04 from '../middleware/4-0-4.js'
import errorHandler from '../middleware/error-middleware.js'

import editSubscriber from '../subscribers/edit.js'

const app = express()

app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CORS_ORIGINS,
  credentials: true,
}))

app.use(documentRouter)

app.use(four04)
app.use(errorHandler)

const state = {
  isOn: false,
  http: null,
}

export const start = () =>
  new Promise((resolve, reject) => {
    if(state.isOn)
      return reject(new Error('ERROR: Server is already running'))
    state.isOn = true
    mongo.start()
      .then(() => {
        state.http = Server(app)
        let subscribers = Object.assign({}, editSubscriber)
        io(state.http, subscribers)

        state.http.listen(process.env.PORT, () => {
          console.log('__SERVER_UP__', process.env.API_URL)
          resolve()
        })
      })
      .catch(reject)
  })

export const stop = () =>
  new Promise((resolve, reject) => {
    if(!state.isOn)
      return reject(new Error('ERROR: Server is already offline'))
    return mongo.stop()
      .then(() => {
        state.http.close(() => {
          console.log('__SERVER_DOWN__')
          state.isOn = false
          state.http = null
          resolve()
        })
      })
      .catch(reject)
  })
